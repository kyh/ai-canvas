import * as React from "react";
import type Konva from "konva";
import {
  Stage,
  Layer,
  Rect,
  Text as KonvaText,
  Group,
  Image as KonvaImage,
  Arrow as KonvaArrow,
  Line as KonvaLine,
  Transformer,
} from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type {
  IEditorBlockFrame,
  IEditorBlockImage,
  IEditorBlockText,
  IEditorBlockArrow,
  IEditorBlockHtml,
  IEditorBlockDraw,
  IEditorBlocks,
} from "@/lib/schema";
import {
  textBlockSchema,
  frameBlockSchema,
  imageBlockSchema,
  arrowBlockSchema,
  drawBlockSchema,
} from "@/lib/schema";
import { generateId } from "@/lib/id-generator";
import ZoomHandler from "./zoomable";
import { parseLinearGradientFill, blockNodeId } from "../utils";
import {
  calculateArrowBounds,
  blockPositionToGroupPosition,
  groupPositionToBlockPosition,
  scaleArrowPoints,
} from "../utils/arrow-bounds";
import {
  editorStoreApi,
  selectOrderedBlocks,
  selectTextBlock,
  useEditorStore,
} from "../use-editor";
import type { EditorStore } from "../use-editor";
import { ensureBlockDefaults, MAX_IMAGE_DIMENSION } from "../services/templates";
import { useCanvasStore } from "../hooks/use-canvas-store";
import { useTransformerSync } from "../hooks/use-transformer-sync";
import { useCanvasZoomPan } from "../hooks/use-canvas-zoom-pan";
import { useCanvasHotkeys } from "../hooks/use-canvas-hotkeys";
import { Html } from "react-konva-utils";

interface PointerPosition {
  x: number;
  y: number;
}

interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ZOOM_STEP = 1.1;

const isTransformerNode = (node: Konva.Node | null, transformer: Konva.Transformer | null) => {
  if (!node || !transformer) {
    return false;
  }
  if (node === transformer) {
    return true;
  }
  let parent: Konva.Node | null = node.getParent();
  while (parent) {
    if (parent === transformer) {
      return true;
    }
    parent = parent.getParent();
  }
  return false;
};

const getCornerRadius = (block: IEditorBlocks) => {
  const { radius } = block;
  if (!radius) {
    return 0;
  }
  const { tl = 0, tr = tl, br = tl, bl = tl } = radius;
  return [tl, tr, br, bl];
};

const getOpacity = (value?: number) => {
  if (value === undefined) {
    return 1;
  }
  return Math.max(0, Math.min(1, value / 100));
};

const useImageElement = (src: string | undefined) => {
  // Keyed by src so a pending load never renders the previous block's image.
  const [loaded, setLoaded] = React.useState<{ src: string; image: HTMLImageElement } | null>(null);

  React.useEffect(() => {
    if (!src) {
      return;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    const handleLoad = () => setLoaded({ image: img, src });
    const handleError = () => setLoaded(null);
    img.addEventListener("load", handleLoad);
    img.addEventListener("error", handleError);
    return () => {
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
    };
  }, [src]);

  return loaded && loaded.src === src ? loaded.image : null;
};

const getScaleWithFlip = (block: IEditorBlocks) => {
  const horizontal = block.flip?.horizontal ? -1 : 1;
  const vertical = block.flip?.vertical ? -1 : 1;
  return {
    scaleX: (block.scaleX ?? 1) * horizontal,
    scaleY: (block.scaleY ?? 1) * vertical,
  };
};

const getShadowProps = (block: IEditorBlocks) => {
  const { shadow } = block;
  if (!shadow?.enabled) {
    return {};
  }
  return {
    shadowBlur: shadow.blur ?? 0,
    shadowColor: shadow.color,
    shadowOffsetX: shadow.offsetX ?? 0,
    shadowOffsetY: shadow.offsetY ?? 0,
  };
};

const mapFillProps = (block: IEditorBlocks) => {
  const fill = block.background;
  if (!fill) {
    return {};
  }
  if (!fill.toLowerCase().includes("gradient")) {
    return { fill };
  }
  return parseLinearGradientFill(fill, block.width, block.height);
};

const isBlockVisible = (block: IEditorBlocks) => block.visible !== false;

const toCanvasCoordinates = (stage: Konva.Stage, position: PointerPosition, zoom: number) => {
  const stagePos = stage.position();
  return {
    x: (position.x - stagePos.x) / zoom,
    y: (position.y - stagePos.y) / zoom,
  };
};

const getPointerPosition = (stage: Konva.Stage | null) => {
  if (!stage) {
    return null;
  }
  const pointer = stage.getPointerPosition();
  if (!pointer) {
    return null;
  }
  return pointer;
};

const rectFromPoints = (start: PointerPosition, end: PointerPosition): SelectionRect => ({
  height: Math.abs(end.y - start.y),
  width: Math.abs(end.x - start.x),
  x: Math.min(start.x, end.x),
  y: Math.min(start.y, end.y),
});

const blockIntersectsRect = (block: IEditorBlocks, rect: SelectionRect) => {
  const bx1 = block.x;
  const by1 = block.y;
  const bx2 = block.x + block.width;
  const by2 = block.y + block.height;

  const rx1 = rect.x;
  const ry1 = rect.y;
  const rx2 = rect.x + rect.width;
  const ry2 = rect.y + rect.height;

  return !(bx2 < rx1 || bx1 > rx2 || by2 < ry1 || by1 > ry2);
};

const calculateDrawBounds = (points: number[]) => {
  const xs: number[] = [];
  const ys: number[] = [];

  for (let i = 0; i < points.length; i += 2) {
    xs.push(points[i]);
    ys.push(points[i + 1]);
  }

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    height: Math.max(1, maxY - minY),
    maxX,
    maxY,
    minX,
    minY,
    width: Math.max(1, maxX - minX),
  } as const;
};

const FrameNode = ({
  block,
  onClick,
  onDragStart,
  onDragEnd,
  onHover,
  draggable,
}: {
  block: IEditorBlockFrame;
  onClick: (event: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragStart: (event: KonvaEventObject<DragEvent>) => void;
  onDragEnd: (position: { x: number; y: number }) => void;
  onHover: (hovering: boolean) => void;
  draggable: boolean;
}) => {
  const { scaleX, scaleY } = getScaleWithFlip(block);
  const fillProps = mapFillProps(block);
  const shadowProps = getShadowProps(block);

  return (
    <Rect
      id={blockNodeId(block.id)}
      name="canvas-node"
      x={block.x}
      y={block.y}
      width={block.width}
      height={block.height}
      rotation={block.rotation ?? 0}
      opacity={getOpacity(block.opacity)}
      cornerRadius={getCornerRadius(block)}
      stroke={block.border?.color}
      strokeWidth={block.border?.width}
      dash={block.border?.dash}
      scaleX={scaleX}
      scaleY={scaleY}
      visible={isBlockVisible(block)}
      onClick={onClick}
      onTap={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      {...fillProps}
      {...shadowProps}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={(event) => {
        const node = event.target;
        onDragEnd({ x: node.x(), y: node.y() });
      }}
      listening
      shadowForStrokeEnabled={false}
      perfectDrawEnabled={false}
    />
  );
};

const TextNode = ({
  block,
  onClick,
  onDragStart,
  onDragEnd,
  onHover,
  draggable,
}: {
  block: IEditorBlockText;
  onClick: (event: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragStart: (event: KonvaEventObject<DragEvent>) => void;
  onDragEnd: (position: { x: number; y: number }) => void;
  onHover: (hovering: boolean) => void;
  draggable: boolean;
}) => {
  const { scaleX, scaleY } = getScaleWithFlip(block);

  return (
    <KonvaText
      id={blockNodeId(block.id)}
      name="canvas-node"
      x={block.x}
      y={block.y}
      width={block.width}
      height={block.height}
      text={block.text}
      fill={block.color}
      fontSize={block.fontSize}
      fontFamily={block.font.family}
      fontStyle={block.font.weight === "400" ? "normal" : "bold"}
      letterSpacing={block.letterSpacing}
      lineHeight={block.lineHeight / block.fontSize}
      align={block.textAlign}
      rotation={block.rotation ?? 0}
      opacity={getOpacity(block.opacity)}
      visible={isBlockVisible(block)}
      scaleX={scaleX}
      scaleY={scaleY}
      draggable={draggable}
      onClick={onClick}
      onTap={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onDragStart={onDragStart}
      onDragEnd={(event) => {
        const node = event.target;
        onDragEnd({ x: node.x(), y: node.y() });
      }}
      listening
      perfectDrawEnabled={false}
    />
  );
};

const ImageNode = ({
  block,
  onClick,
  onDragStart,
  onDragEnd,
  onHover,
  draggable,
}: {
  block: IEditorBlockImage;
  onClick: (event: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragStart: (event: KonvaEventObject<DragEvent>) => void;
  onDragEnd: (position: { x: number; y: number }) => void;
  onHover: (hovering: boolean) => void;
  draggable: boolean;
}) => {
  const image = useImageElement(block.url);
  const { scaleX, scaleY } = getScaleWithFlip(block);
  const shadowProps = getShadowProps(block);

  if (!image || image.width === 0 || image.height === 0) {
    return null;
  }

  return (
    <KonvaImage
      id={blockNodeId(block.id)}
      name="canvas-node"
      x={block.x}
      y={block.y}
      width={block.width}
      height={block.height}
      image={image ?? undefined}
      opacity={getOpacity(block.opacity)}
      rotation={block.rotation ?? 0}
      scaleX={scaleX}
      scaleY={scaleY}
      cornerRadius={getCornerRadius(block)}
      listening
      draggable={draggable}
      onClick={onClick}
      onTap={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onDragStart={onDragStart}
      onDragEnd={(event) => {
        const node = event.target;
        onDragEnd({ x: node.x(), y: node.y() });
      }}
      visible={isBlockVisible(block)}
      {...shadowProps}
      perfectDrawEnabled={false}
    />
  );
};

const ArrowNode = ({
  block,
  onClick,
  onDragStart,
  onDragEnd,
  onHover,
  draggable,
}: {
  block: IEditorBlockArrow;
  onClick: (event: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragStart: (event: KonvaEventObject<DragEvent>) => void;
  onDragEnd: (position: { x: number; y: number }) => void;
  onHover: (hovering: boolean) => void;
  draggable: boolean;
}) => {
  const { scaleX, scaleY } = getScaleWithFlip(block);
  const shadowProps = getShadowProps(block);

  // Calculate bounding box and positioning using utility function
  const bounds = calculateArrowBounds(block);
  const groupPos = blockPositionToGroupPosition(block.x, block.y, block);

  return (
    <Group
      id={blockNodeId(block.id)}
      name="canvas-node"
      x={groupPos.x}
      y={groupPos.y}
      width={bounds.width}
      height={bounds.height}
      rotation={block.rotation ?? 0}
      scaleX={scaleX}
      scaleY={scaleY}
      opacity={getOpacity(block.opacity)}
      visible={isBlockVisible(block)}
      draggable={draggable}
      onClick={onClick}
      onTap={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onDragStart={onDragStart}
      onDragEnd={(event) => {
        const node = event.target;
        // Pass the Group's position directly - handleNodeDragEnd will calculate the offset
        onDragEnd({ x: node.x(), y: node.y() });
      }}
      listening
    >
      <KonvaArrow
        points={bounds.adjustedPoints}
        pointerLength={block.pointerLength ?? 20}
        pointerWidth={block.pointerWidth ?? 20}
        fill={block.fill ?? block.stroke ?? "#000000"}
        stroke={block.stroke ?? block.fill ?? "#000000"}
        strokeWidth={block.strokeWidth ?? 4}
        {...shadowProps}
        perfectDrawEnabled={false}
      />
    </Group>
  );
};

const DrawNode = ({
  block,
  onClick,
  onDragStart,
  onDragEnd,
  onHover,
  draggable,
}: {
  block: IEditorBlockDraw;
  onClick: (event: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragStart: (event: KonvaEventObject<DragEvent>) => void;
  onDragEnd: (position: { x: number; y: number }) => void;
  onHover: (hovering: boolean) => void;
  draggable: boolean;
}) => {
  const { scaleX, scaleY } = getScaleWithFlip(block);
  const shadowProps = getShadowProps(block);

  return (
    <Group
      id={blockNodeId(block.id)}
      name="canvas-node"
      x={block.x}
      y={block.y}
      width={block.width}
      height={block.height}
      rotation={block.rotation ?? 0}
      scaleX={scaleX}
      scaleY={scaleY}
      opacity={getOpacity(block.opacity)}
      visible={isBlockVisible(block)}
      draggable={draggable}
      onClick={onClick}
      onTap={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onDragStart={onDragStart}
      onDragEnd={(event) => {
        const node = event.target;
        onDragEnd({ x: node.x(), y: node.y() });
      }}
      listening
    >
      <KonvaLine
        points={block.points}
        stroke={block.stroke ?? "#000000"}
        strokeWidth={block.strokeWidth ?? 3}
        tension={block.tension ?? 0}
        lineCap="round"
        lineJoin="round"
        perfectDrawEnabled={false}
        {...shadowProps}
      />
    </Group>
  );
};

const HtmlFrame = ({ html }: { html: string }) => {
  // Use a hash of the HTML as key to force iframe re-render when content changes
  const htmlKey = React.useMemo(
    () => html.length + (html.slice(0, 100).replaceAll(/\s/gu, "").length % 1000),
    [html],
  );

  return (
    <iframe
      key={htmlKey}
      title="Generated HTML block"
      // model-authored markup: allow it to script itself, but not to reach this origin
      sandbox="allow-scripts"
      srcDoc={html}
      style={{
        border: "none",
        display: "block",
        height: "100%",
        width: "100%",
      }}
    />
  );
};

const HtmlContent = React.memo(HtmlFrame, (prev, next) => prev.html === next.html);

HtmlContent.displayName = "HtmlContent";

const HtmlNode = ({
  block,
  onClick,
  onDragStart,
  onDragEnd,
  onHover,
  draggable,
  isSelecting,
}: {
  block: IEditorBlockHtml;
  onClick: (event: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragStart: (event: KonvaEventObject<DragEvent>) => void;
  onDragEnd: (position: { x: number; y: number }) => void;
  onHover: (hovering: boolean) => void;
  draggable: boolean;
  isSelecting: boolean;
}) => {
  const { scaleX, scaleY } = getScaleWithFlip(block);
  const fillProps = mapFillProps(block);
  const shadowProps = getShadowProps(block);

  const htmlDivProps = React.useMemo(
    () => ({
      style: {
        boxSizing: "border-box" as const,
        height: `${block.height}px`,
        overflow: "visible" as const,
        padding: "8px",
        pointerEvents: isSelecting ? ("none" as const) : ("auto" as const),
        width: `${block.width}px`,
      },
    }),
    [block.width, block.height, isSelecting],
  );

  const htmlGroupProps = React.useMemo(() => ({ x: 0, y: 0 }), []);

  return (
    <Group
      id={blockNodeId(block.id)}
      name="canvas-node"
      x={block.x}
      y={block.y}
      width={block.width}
      height={block.height}
      rotation={block.rotation ?? 0}
      scaleX={scaleX}
      scaleY={scaleY}
      opacity={getOpacity(block.opacity)}
      visible={isBlockVisible(block)}
      draggable={draggable}
      onClick={onClick}
      onTap={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onDragStart={onDragStart}
      onDragEnd={(event) => {
        const node = event.target;
        onDragEnd({ x: node.x(), y: node.y() });
      }}
      listening
    >
      <Rect
        x={0}
        y={0}
        width={block.width}
        height={block.height}
        cornerRadius={getCornerRadius(block)}
        stroke={block.border?.color}
        strokeWidth={block.border?.width}
        dash={block.border?.dash}
        {...fillProps}
        {...shadowProps}
        perfectDrawEnabled={false}
      />
      <Html key={block.id} groupProps={htmlGroupProps} divProps={htmlDivProps}>
        <HtmlContent html={block.html} />
      </Html>
    </Group>
  );
};

// Helper to get outline bounds for any block type - ensures consistency
const getBlockOutlineBounds = (block: IEditorBlocks) => {
  if (block.type === "arrow") {
    const arrowBlock = block;
    const bounds = calculateArrowBounds(arrowBlock);
    const groupPos = blockPositionToGroupPosition(arrowBlock.x, arrowBlock.y, arrowBlock);
    return {
      height: bounds.height,
      width: bounds.width,
      x: groupPos.x,
      y: groupPos.y,
    };
  }
  return {
    height: block.height,
    width: block.width,
    x: block.x,
    y: block.y,
  };
};

const HoverOutline = ({ block, zoom }: { block: IEditorBlocks; zoom: number }) => {
  const { scaleX, scaleY } = getScaleWithFlip(block);
  const bounds = getBlockOutlineBounds(block);

  return (
    <Rect
      x={bounds.x}
      y={bounds.y}
      width={bounds.width}
      height={bounds.height}
      rotation={block.rotation ?? 0}
      scaleX={scaleX}
      scaleY={scaleY}
      stroke="#6366f1"
      dash={[6 / zoom, 6 / zoom]}
      strokeWidth={1 / zoom}
      listening={false}
      cornerRadius={block.type === "arrow" ? 0 : getCornerRadius(block)}
      opacity={0.8}
    />
  );
};

const SelectionOutline = ({ rect, zoom }: { rect: SelectionRect | null; zoom: number }) => {
  if (!rect) {
    return null;
  }
  return (
    <Rect
      x={rect.x}
      y={rect.y}
      width={rect.width}
      height={rect.height}
      stroke="#4f46e5"
      dash={[4 / zoom, 4 / zoom]}
      strokeWidth={1 / zoom}
      fill="#4f46e510"
      listening={false}
    />
  );
};

// Helper functions to calculate block placement - ensures preview and final placement match

const DEFAULT_BLOCK_SIZES = {
  // Arrow uses points, not width/height
  arrow: { height: 0, width: 200 },
  frame: { height: 240, width: 240 },
  html: { height: 240, width: 240 },
  text: { height: 52, width: 320 },
} as const;

const defaultBlockSize = (
  blockType: "text" | "frame" | "image",
  pendingImageData?: { url: string; width: number; height: number } | null,
) => {
  if (blockType === "text") {
    return DEFAULT_BLOCK_SIZES.text;
  }
  if (blockType === "frame") {
    return DEFAULT_BLOCK_SIZES.frame;
  }
  if (blockType === "image" && pendingImageData) {
    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(pendingImageData.width, pendingImageData.height),
    );
    return {
      height: Math.max(1, Math.round(pendingImageData.height * scale)),
      width: Math.max(1, Math.round(pendingImageData.width * scale)),
    };
  }
  return { height: 100, width: 100 };
};

const calculateBlockPlacement = (
  start: PointerPosition,
  current: PointerPosition | null,
  blockType: "text" | "frame" | "image",
  isDrag: boolean,
  pendingImageData?: { url: string; width: number; height: number } | null,
) => {
  if (!current) {
    return null;
  }

  if (!isDrag) {
    const { height, width } = defaultBlockSize(blockType, pendingImageData);
    return { height, width, x: start.x, y: start.y };
  }

  const dx = current.x - start.x;
  const dy = current.y - start.y;
  let width = Math.abs(dx);
  let height = Math.abs(dy);

  // For images, maintain aspect ratio during drag
  if (blockType === "image" && pendingImageData) {
    const aspectRatio = pendingImageData.width / pendingImageData.height;
    if (Math.abs(dx) > Math.abs(dy)) {
      height = width / aspectRatio;
    } else {
      width = height * aspectRatio;
    }
  }

  return { height, width, x: Math.min(start.x, current.x), y: Math.min(start.y, current.y) };
};

const calculateArrowPlacement = (
  clickPosition: PointerPosition,
  points: [number, number, number, number],
) => {
  // Arrow points [0, 0, dx, dy] mean the arrow goes from (block.x, block.y) to (block.x + dx, block.y + dy)
  // We want the arrow start point to always be at clickPosition
  // So: block.x + offsetX + adjustedPoints[0] = clickPosition.x
  // Since adjustedPoints[0] = points[0] - offsetX = 0 - offsetX = -offsetX
  // We get: block.x + offsetX - offsetX = block.x = clickPosition.x
  // Therefore, block.x should equal clickPosition.x (not adjusted)

  const tempBlock: IEditorBlockArrow = {
    fill: "#000000",
    height: 0,
    id: "",
    label: "",
    opacity: 100,
    pointerLength: 20,
    pointerWidth: 20,
    points,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    stroke: "#000000",
    strokeWidth: 4,
    type: "arrow",
    visible: true,
    width: 0,
    x: clickPosition.x,
    y: clickPosition.y,
  };
  const bounds = calculateArrowBounds(tempBlock);

  // The arrow start point renders at: Group.x + adjustedPoints[0]
  // Where: Group.x = block.x + offsetX, and adjustedPoints[0] = points[0] - offsetX = -offsetX
  // So: arrow start = (block.x + offsetX) + (-offsetX) = block.x
  // We want the arrow start to be at clickPosition, so: block.x = clickPosition.x
  // But when we store the block, we need to account for the offset so it renders correctly
  // The stored block position should be: clickPosition (not adjusted)
  // This way when rendered: Group.x = clickPosition.x + offsetX, and arrow renders at clickPosition.x
  const blockX = clickPosition.x;
  const blockY = clickPosition.y;

  // For preview rendering, calculate group position that makes arrow start at clickPosition
  // Group.x = block.x + offsetX = clickPosition.x + offsetX
  // Arrow start = Group.x + adjustedPoints[0] = (clickPosition.x + offsetX) + (-offsetX) = clickPosition.x ✓
  const groupPos = blockPositionToGroupPosition(blockX, blockY, tempBlock);

  return {
    adjustedPoints: bounds.adjustedPoints,
    blockPosition: { x: blockX, y: blockY },
    bounds,
    groupPosition: groupPos,
  };
};

const PlacementPreview = ({
  mode,
  start,
  current,
  zoom,
  pendingImageData,
}: {
  mode: "text" | "frame" | "arrow" | "image";
  start: PointerPosition;
  current: PointerPosition | null;
  zoom: number;
  pendingImageData: { url: string; width: number; height: number } | null;
}) => {
  if (!current) {
    return null;
  }

  const dx = current.x - start.x;
  const dy = current.y - start.y;
  const distance = Math.hypot(dx, dy);
  const isDrag = distance > 5;

  if (mode === "arrow") {
    const points: [number, number, number, number] = isDrag ? [0, 0, dx, dy] : [0, 0, 200, 0];
    const placement = calculateArrowPlacement(start, points);
    return (
      <Group
        x={placement.groupPosition.x}
        y={placement.groupPosition.y}
        opacity={0.5}
        listening={false}
      >
        <KonvaArrow
          points={placement.adjustedPoints}
          pointerLength={20}
          pointerWidth={20}
          fill="#000000"
          stroke="#000000"
          strokeWidth={4}
        />
      </Group>
    );
  }

  // For other block types, use shared calculation
  const placement = calculateBlockPlacement(start, current, mode, isDrag, pendingImageData);

  if (!placement) {
    return null;
  }

  const isFrame = mode === "frame";
  const fillProps = isFrame ? { fill: "#ffffff" } : {};
  const strokeColor = isFrame ? "#d1d5db" : "#6366f1";

  return (
    <Rect
      x={placement.x}
      y={placement.y}
      width={placement.width}
      height={placement.height}
      stroke={strokeColor}
      strokeWidth={1 / zoom}
      dash={[4 / zoom, 4 / zoom]}
      fill={isFrame ? "#ffffff80" : "transparent"}
      cornerRadius={isFrame ? 16 : 0}
      listening={false}
      opacity={0.5}
      {...fillProps}
    />
  );
};

type PlacementMode = React.ComponentProps<typeof PlacementPreview>["mode"];

// `placementMode` carries the narrowing to the JSX below: a boolean helper
// proves nothing to the compiler about `mode` at the use site, so keep the
// narrowed value itself and derive the predicate from it.
const toPlacementMode = (mode: EditorStore["canvas"]["mode"]): PlacementMode | null =>
  mode === "text" || mode === "frame" || mode === "arrow" || mode === "image" ? mode : null;

const stageCursor = (isMoveMode: boolean, isTextEditing: boolean, isStageDragging: boolean) => {
  if (!isMoveMode || isTextEditing) {
    return "default";
  }
  return isStageDragging ? "grabbing" : "grab";
};

const backgroundFillProps = (
  background: string | undefined,
  size: { width: number; height: number },
) =>
  background && background.toLowerCase().includes("gradient")
    ? parseLinearGradientFill(background, size.width, size.height)
    : { fill: background ?? "#ffffff" };

const EditorCanvas = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<Konva.Stage | null>(null);
  const transformerRef = React.useRef<Konva.Transformer | null>(null);
  const selectionStartRef = React.useRef<PointerPosition | null>(null);
  const selectionChangedRef = React.useRef(false);
  const isAltDragRef = React.useRef(false);
  const originalPositionsRef = React.useRef<Map<string, { x: number; y: number }>>(new Map());

  const [selectionRect, setSelectionRect] = React.useState<SelectionRect | null>(null);
  const [previewSelectionIds, setPreviewSelectionIds] = React.useState<string[]>([]);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [drawingPoints, setDrawingPoints] = React.useState<number[]>([]);
  const drawingPointsRef = React.useRef<number[]>([]);
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [editingText, setEditingText] = React.useState<{
    id: string;
    value: string;
    clientX: number;
    clientY: number;
    width: number;
    height: number;
    scale: number;
  } | null>(null);
  const [isStageDragging, setIsStageDragging] = React.useState(false);
  const [isPlacingBlock, setIsPlacingBlock] = React.useState(false);
  const [placementStart, setPlacementStart] = React.useState<PointerPosition | null>(null);
  const [placementCurrent, setPlacementCurrent] = React.useState<PointerPosition | null>(null);
  const [placementHasMoved, setPlacementHasMoved] = React.useState(false);

  const {
    blocks,
    selectedIds,
    hoveredId,
    mode,
    isTextEditing,
    zoom,
    stagePosition,
    containerSize,
    size,
    background,
    setSelectedIds,
    setHoveredId,
    setStage,
    setStageZoom,
    setStagePosition,
    setCanvasContainerSize,
    setIsTextEditing,
    setMode,
    deleteSelectedBlocks,
    setBlockPosition,
    updateBlockValues,
  } = useCanvasStore();

  const pendingImageData = useEditorStore((state) => state.pendingImageData);

  const { applyZoom, handleWheel } = useCanvasZoomPan({
    containerRef,
    containerSize,
    setStagePosition,
    setStageZoom,
    stagePosition,
    stageRef,
    zoom,
  });

  const handleStageRef = React.useCallback(
    (node: Konva.Stage | null) => {
      stageRef.current = node;
      setStage(node);
    },
    [setStage],
  );

  const copySelectedBlocks = useEditorStore((state) => state.copySelectedBlocks);
  const pasteBlocks = useEditorStore((state) => state.pasteBlocks);
  const editorStage = useEditorStore((state) => state.stage);

  useCanvasHotkeys({
    copySelectedBlocks,
    deleteSelectedBlocks,
    pasteBlocks,
    setMode,
    stage: editorStage,
    zoom,
  });

  const placementMode = toPlacementMode(mode);
  const isPlacementMode = React.useCallback(() => placementMode !== null, [placementMode]);

  const isSelectMode = mode === "select";
  const isMoveMode = mode === "move";

  const drawingPreview = React.useMemo(() => {
    if (!isDrawing || drawingPoints.length < 4) {
      return null;
    }

    const bounds = calculateDrawBounds(drawingPoints);
    const points = drawingPoints.map((value, index) =>
      index % 2 === 0 ? value - bounds.minX : value - bounds.minY,
    );

    return { bounds, points } as const;
  }, [drawingPoints, isDrawing]);

  const createBlockAtPosition = React.useCallback(
    (
      position: PointerPosition,
      endPosition?: PointerPosition,
      dragSize?: { width: number; height: number },
    ) => {
      const blockType = mode;
      const currentBlocks = selectOrderedBlocks(editorStoreApi.getState());

      if (blockType === "text") {
        // Use shared calculation for consistency
        const isDrag = !!dragSize;
        const placement = calculateBlockPlacement(
          position,
          endPosition || position,
          "text",
          isDrag,
        );
        if (!placement) {
          return;
        }

        const defaultBlock = ensureBlockDefaults(
          textBlockSchema.parse({
            color: "#1f2933",
            font: { family: "Poppins", weight: "500" },
            fontSize: 24,
            height: placement.height,
            id: generateId(),
            label: `Text ${currentBlocks.length + 1}`,
            letterSpacing: 0,
            lineHeight: 32,
            opacity: 100,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            text: "New text",
            textAlign: "left",
            type: "text",
            visible: true,
            width: placement.width,
            x: placement.x,
            y: placement.y,
          } satisfies IEditorBlockText),
        );
        editorStoreApi.getState().addBlock(defaultBlock);
        setMode("select");
      } else if (blockType === "frame") {
        // Use shared calculation for consistency
        const isDrag = !!dragSize;
        const placement = calculateBlockPlacement(
          position,
          endPosition || position,
          "frame",
          isDrag,
        );
        if (!placement) {
          return;
        }

        const defaultBlock = ensureBlockDefaults(
          frameBlockSchema.parse({
            background: "#ffffff",
            border: {
              color: "#d1d5db",
              width: 1,
            },
            height: placement.height,
            id: generateId(),
            label: `Frame ${currentBlocks.length + 1}`,
            opacity: 100,
            radius: { bl: 16, br: 16, tl: 16, tr: 16 },
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            type: "frame",
            visible: true,
            width: placement.width,
            x: placement.x,
            y: placement.y,
          } satisfies IEditorBlockFrame),
        );
        editorStoreApi.getState().addBlock(defaultBlock);
        setMode("select");
      } else if (blockType === "arrow") {
        // Use same calculation as preview
        const points: [number, number, number, number] = dragSize
          ? [0, 0, dragSize.width, dragSize.height]
          : [0, 0, 200, 0];
        const placement = calculateArrowPlacement(position, points);
        const defaultBlock = ensureBlockDefaults(
          arrowBlockSchema.parse({
            fill: "#000000",
            height: placement.bounds.height,
            id: generateId(),
            label: `Arrow ${currentBlocks.length + 1}`,
            opacity: 100,
            pointerLength: 20,
            pointerWidth: 20,
            points,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            stroke: "#000000",
            strokeWidth: 4,
            type: "arrow",
            visible: true,
            width: placement.bounds.width,
            x: placement.blockPosition.x,
            y: placement.blockPosition.y,
          } satisfies IEditorBlockArrow),
        );
        editorStoreApi.getState().addBlock(defaultBlock);
        setMode("select");
      } else if (blockType === "image" && pendingImageData) {
        // Use shared calculation for consistency
        const isDrag = !!dragSize;
        const placement = calculateBlockPlacement(
          position,
          endPosition || position,
          "image",
          isDrag,
          pendingImageData,
        );
        if (!placement) {
          return;
        }

        const defaultBlock = ensureBlockDefaults(
          imageBlockSchema.parse({
            fit: "contain",
            height: placement.height,
            id: generateId(),
            label: `Image ${currentBlocks.length + 1}`,
            opacity: 100,
            position: "center",
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            type: "image",
            url: pendingImageData.url,
            visible: true,
            width: placement.width,
            x: placement.x,
            y: placement.y,
          } satisfies IEditorBlockImage),
        );
        editorStoreApi.getState().addBlock(defaultBlock);
        editorStoreApi.getState().setPendingImageData(null);
        setMode("select");
      }
    },
    [mode, pendingImageData, setMode],
  );

  const finishDrawing = React.useCallback(() => {
    if (!isDrawing) {
      return;
    }

    const points = drawingPointsRef.current;
    setIsDrawing(false);

    if (points.length < 4) {
      drawingPointsRef.current = [];
      setDrawingPoints([]);
      return;
    }

    const bounds = calculateDrawBounds(points);
    const relativePoints = points.map((value, index) =>
      index % 2 === 0 ? value - bounds.minX : value - bounds.minY,
    );

    const currentBlocks = selectOrderedBlocks(editorStoreApi.getState());
    const drawBlock = ensureBlockDefaults(
      drawBlockSchema.parse({
        height: bounds.height,
        id: generateId(),
        label: `Draw ${currentBlocks.length + 1}`,
        opacity: 100,
        points: relativePoints,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        stroke: "#000000",
        strokeWidth: 3,
        tension: 0,
        type: "draw",
        visible: true,
        width: bounds.width,
        x: bounds.minX,
        y: bounds.minY,
      } satisfies IEditorBlockDraw),
    );

    editorStoreApi.getState().addBlock(drawBlock);
    drawingPointsRef.current = [];
    setDrawingPoints([]);
  }, [isDrawing]);

  React.useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      if (!entry) {
        return;
      }
      const { width, height } = entry.contentRect;
      setCanvasContainerSize({ height, width });
    });
    const node = containerRef.current;
    if (node) {
      observer.observe(node);
    }
    return () => {
      if (node) {
        observer.unobserve(node);
      }
    };
  }, [setCanvasContainerSize]);

  useTransformerSync(stageRef, transformerRef, blocks, selectedIds);

  const updateSelection = React.useCallback(
    (updater: (current: string[]) => string[]) => {
      const current = editorStoreApi.getState().selectedIds;
      const next = updater(current);
      setSelectedIds(next);
    },
    [setSelectedIds],
  );

  const handleNodeSelection = React.useCallback(
    (block: IEditorBlocks, evt: KonvaEventObject<MouseEvent | TouchEvent>) => {
      evt.cancelBubble = true;
      if (!isBlockVisible(block) || !isSelectMode) {
        return;
      }
      const isMulti = evt.evt.shiftKey;
      setHoveredId(block.id);
      if (isMulti) {
        updateSelection((current) => {
          if (current.includes(block.id)) {
            return current;
          }
          return [...current, block.id];
        });
      } else {
        setSelectedIds([block.id]);
      }
    },
    [setHoveredId, setSelectedIds, updateSelection, isSelectMode],
  );

  const commitSelectionRect = React.useCallback(() => {
    setIsSelecting(false);
    setSelectionRect(null);
    selectionStartRef.current = null;
    setPreviewSelectionIds([]);
  }, []);

  // Mode-specific handlers
  const handlePlacementMouseDown = React.useCallback(
    (stage: Konva.Stage, pointer: PointerPosition) => {
      const canvasPoint = toCanvasCoordinates(stage, pointer, zoom);
      setPlacementStart(canvasPoint);
      setPlacementCurrent(canvasPoint);
      setPlacementHasMoved(false);
      setIsPlacingBlock(true);
    },
    [zoom],
  );

  const handleSelectionMouseDown = React.useCallback(
    (stage: Konva.Stage, pointer: PointerPosition, shiftKey: boolean) => {
      if (!shiftKey) {
        setSelectedIds([]);
      }
      setPreviewSelectionIds([]);
      selectionChangedRef.current = false;
      const canvasPoint = toCanvasCoordinates(stage, pointer, zoom);
      selectionStartRef.current = canvasPoint;
      setSelectionRect({
        height: 0,
        width: 0,
        x: canvasPoint.x,
        y: canvasPoint.y,
      });
      setIsSelecting(true);
    },
    [setSelectedIds, zoom],
  );

  const handleStageMouseDown = React.useCallback(
    (event: KonvaEventObject<MouseEvent>) => {
      const stage = stageRef.current;
      if (!stage || isMoveMode) {
        return;
      }

      const { target } = event;
      const transformer = transformerRef.current;
      if (isTransformerNode(target, transformer)) {
        return;
      }

      const isCanvasNode = target.hasName("canvas-node");
      const pointer = getPointerPosition(stage);
      if (!pointer) {
        return;
      }

      if (mode === "draw") {
        const canvasPoint = toCanvasCoordinates(stage, pointer, zoom);
        const points = [canvasPoint.x, canvasPoint.y];
        drawingPointsRef.current = points;
        setDrawingPoints(points);
        setIsDrawing(true);
        setSelectedIds([]);
        setHoveredId(null);
        return;
      }

      // Handle placement mode - allow placement even on top of existing blocks
      if (isPlacementMode()) {
        handlePlacementMouseDown(stage, pointer);
        return;
      }

      // Handle selection mode
      if (!isSelectMode) {
        return;
      }

      // Don't start selection if clicking on a canvas node
      if (isCanvasNode) {
        return;
      }

      handleSelectionMouseDown(stage, pointer, event.evt.shiftKey);
    },
    [
      isMoveMode,
      isPlacementMode,
      isSelectMode,
      mode,
      zoom,
      setSelectedIds,
      setHoveredId,
      setIsDrawing,
      setDrawingPoints,
      handlePlacementMouseDown,
      handleSelectionMouseDown,
    ],
  );

  const handleStageMouseMove = React.useCallback(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    if (isDrawing) {
      const pointer = getPointerPosition(stage);
      if (pointer) {
        const canvasPoint = toCanvasCoordinates(stage, pointer, zoom);
        const nextPoints = [...drawingPointsRef.current, canvasPoint.x, canvasPoint.y];
        drawingPointsRef.current = nextPoints;
        setDrawingPoints(nextPoints);
      }
      return;
    }

    // Handle placement drag
    if (isPlacingBlock && placementStart) {
      const pointer = getPointerPosition(stage);
      if (pointer) {
        const canvasPoint = toCanvasCoordinates(stage, pointer, zoom);
        setPlacementCurrent(canvasPoint);
        // Check if mouse has moved
        if (placementStart) {
          const dx = canvasPoint.x - placementStart.x;
          const dy = canvasPoint.y - placementStart.y;
          const distance = Math.hypot(dx, dy);
          if (distance > 2) {
            setPlacementHasMoved(true);
          }
        }
      }
      return;
    }

    // Handle selection drag
    if (!isSelecting) {
      setPreviewSelectionIds([]);
      return;
    }
    const pointer = getPointerPosition(stage);
    if (!pointer || !selectionStartRef.current) {
      return;
    }
    const canvasPoint = toCanvasCoordinates(stage, pointer, zoom);
    const rect = rectFromPoints(selectionStartRef.current, canvasPoint);
    setSelectionRect(rect);
    const previewIds = blocks
      .filter((block) => isBlockVisible(block) && blockIntersectsRect(block, rect))
      .map((block) => block.id);
    setPreviewSelectionIds(previewIds);
  }, [blocks, isDrawing, isSelecting, zoom, isPlacingBlock, placementStart]);

  const handleStageMouseUp = React.useCallback(() => {
    if (isDrawing) {
      finishDrawing();
      return;
    }

    // Handle placement completion
    if (isPlacingBlock && placementStart) {
      if (placementCurrent) {
        const dx = placementCurrent.x - placementStart.x;
        const dy = placementCurrent.y - placementStart.y;
        const distance = Math.hypot(dx, dy);

        // If moved more than 5 pixels, treat as drag; otherwise single click
        if (distance > 5) {
          // Drag: create block with custom size
          if (mode === "arrow") {
            // For arrows, use the drag vector directly
            createBlockAtPosition(placementStart, placementCurrent, {
              height: dy,
              width: dx,
            });
          } else {
            // For other blocks, pass start and end - helper will calculate position
            createBlockAtPosition(placementStart, placementCurrent, {
              height: Math.abs(dy),
              width: Math.abs(dx),
            });
          }
        } else {
          // Single click: create block with default size
          createBlockAtPosition(placementStart, placementStart);
        }
      } else {
        // Fallback: single click
        createBlockAtPosition(placementStart, placementStart);
      }

      setIsPlacingBlock(false);
      setPlacementStart(null);
      setPlacementCurrent(null);
      setPlacementHasMoved(false);
      return;
    }

    // Handle selection completion
    if (!isSelecting || !selectionRect) {
      commitSelectionRect();
      return;
    }
    const newSelection = blocks
      .filter((block) => isBlockVisible(block) && blockIntersectsRect(block, selectionRect))
      .map((block) => block.id);
    updateSelection((current) => {
      if (current.length === 0) {
        selectionChangedRef.current = newSelection.length > 0;
        return newSelection;
      }
      const merged = new Set(current);
      for (const id of newSelection) {
        merged.add(id);
      }
      selectionChangedRef.current = newSelection.length > 0;
      return [...merged];
    });
    commitSelectionRect();
  }, [
    blocks,
    commitSelectionRect,
    isSelecting,
    selectionRect,
    updateSelection,
    isPlacingBlock,
    placementStart,
    placementCurrent,
    mode,
    createBlockAtPosition,
    isDrawing,
    finishDrawing,
  ]);

  const handleStageClick = React.useCallback(
    (event: KonvaEventObject<MouseEvent>) => {
      const stage = stageRef.current;
      if (!stage || !isSelectMode) {
        return;
      }
      if (selectionChangedRef.current) {
        selectionChangedRef.current = false;
        return;
      }
      const { target } = event;
      const transformer = transformerRef.current;
      if (isTransformerNode(target, transformer)) {
        return;
      }
      if (!target.hasName("canvas-node")) {
        setSelectedIds([]);
        setPreviewSelectionIds([]);
      }
    },
    [setSelectedIds, isSelectMode],
  );

  const handleStageDragMove = React.useCallback(
    (event: KonvaEventObject<DragEvent>) => {
      const stage = stageRef.current;
      if (!stage || event.target !== stage) {
        return;
      }
      setStagePosition({ x: stage.x(), y: stage.y() });
    },
    [setStagePosition],
  );

  const handleStageDragEnd = React.useCallback(
    (event: KonvaEventObject<DragEvent>) => {
      const stage = stageRef.current;
      if (!stage || event.target !== stage) {
        return;
      }
      setStagePosition({ x: stage.x(), y: stage.y() });
      setIsStageDragging(false);
    },
    [setStagePosition],
  );

  const handleStageDragStart = React.useCallback((event: KonvaEventObject<DragEvent>) => {
    const stage = stageRef.current;
    if (!stage || event.target !== stage) {
      return;
    }
    setIsStageDragging(true);
  }, []);

  const handleNodeDragEnd = React.useCallback(
    (id: string, position: { x: number; y: number }) => {
      // If Alt was pressed, copy instead of move
      if (isAltDragRef.current) {
        // Calculate the offset from the original position
        const originalPos = originalPositionsRef.current.get(id);
        if (!originalPos) {
          // Fallback to normal drag if we don't have original position
          isAltDragRef.current = false;
          originalPositionsRef.current.clear();
          const block = blocks.find((b) => b.id === id);
          if (block?.type === "arrow") {
            const arrowBlock = block;
            const blockPos = groupPositionToBlockPosition(position.x, position.y, arrowBlock);
            setBlockPosition(id, blockPos);
          } else {
            setBlockPosition(id, position);
          }
          return;
        }

        // Calculate offset in block coordinate space
        const draggedBlock = blocks.find((b) => b.id === id);
        let offsetX: number;
        let offsetY: number;

        if (draggedBlock?.type === "arrow") {
          // For arrows, convert both positions to block coordinates
          const arrowBlock = draggedBlock;
          const originalBlockPos = groupPositionToBlockPosition(
            originalPos.x,
            originalPos.y,
            arrowBlock,
          );
          const newBlockPos = groupPositionToBlockPosition(position.x, position.y, arrowBlock);
          offsetX = newBlockPos.x - originalBlockPos.x;
          offsetY = newBlockPos.y - originalBlockPos.y;
        } else {
          // For other blocks, positions are already in block coordinates
          offsetX = position.x - originalPos.x;
          offsetY = position.y - originalPos.y;
        }

        // Copy all selected blocks
        copySelectedBlocks();

        // Calculate the minimum x and y from selected blocks to maintain relative positions
        const selectedBlocks = blocks.filter((b) => selectedIds.includes(b.id));
        const minX = Math.min(...selectedBlocks.map((b) => b.x));
        const minY = Math.min(...selectedBlocks.map((b) => b.y));

        // Paste at the new position
        const pasteX = minX + offsetX;
        const pasteY = minY + offsetY;
        pasteBlocks({ x: pasteX, y: pasteY });

        // Reset all selected blocks to their original positions
        for (const [blockId, storedPos] of originalPositionsRef.current) {
          const block = blocks.find((b) => b.id === blockId);
          if (block?.type === "arrow") {
            const arrowBlock = block;
            const blockPos = groupPositionToBlockPosition(storedPos.x, storedPos.y, arrowBlock);
            setBlockPosition(blockId, blockPos);
          } else {
            setBlockPosition(blockId, storedPos);
          }
        }

        // Reset Alt drag state
        isAltDragRef.current = false;
        originalPositionsRef.current.clear();
      } else {
        // Normal drag behavior
        const block = blocks.find((b) => b.id === id);
        if (block?.type === "arrow") {
          const arrowBlock = block;
          // Convert Group position back to block position
          const blockPos = groupPositionToBlockPosition(position.x, position.y, arrowBlock);
          setBlockPosition(id, blockPos);
        } else {
          setBlockPosition(id, position);
        }
      }
    },
    [setBlockPosition, blocks, selectedIds, copySelectedBlocks, pasteBlocks],
  );

  const handleTransform = React.useCallback(() => {
    const transformer = transformerRef.current;
    if (!transformer) {
      return;
    }
    for (const node of transformer.nodes()) {
      const id = node.id().replace("block-", "");
      const block = blocks.find((b) => b.id === id);
      if (!block) {
        continue;
      }

      // For text blocks, update width/height in real-time to prevent deformation
      if (block.type === "text") {
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const newWidth = Math.max(1, node.width() * scaleX);
        const newHeight = Math.max(1, node.height() * scaleY);

        // Update the node's width/height directly to prevent text deformation
        node.width(newWidth);
        node.height(newHeight);
        node.scaleX(1);
        node.scaleY(1);
      }
    }
  }, [blocks]);

  const handleTransformEnd = React.useCallback(() => {
    const transformer = transformerRef.current;
    if (!transformer) {
      return;
    }
    for (const node of transformer.nodes()) {
      const id = node.id().replace("block-", "");
      const block = blocks.find((b) => b.id === id);
      if (!block) {
        continue;
      }
      const rotation = node.rotation();

      // For text blocks, width/height were already updated in handleTransform
      // so we can use them directly (scale is already 1)
      // We also reset scaleX/scaleY to 1 to prevent deformation
      if (block.type === "text") {
        const width = Math.max(1, node.width());
        const height = Math.max(1, node.height());
        updateBlockValues(id, {
          height,
          rotation,
          scaleX: 1,
          scaleY: 1,
          width,
          x: node.x(),
          y: node.y(),
        });
        continue;
      }

      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const width = Math.max(1, node.width() * scaleX);
      const height = Math.max(1, node.height() * scaleY);
      node.scaleX(1);
      node.scaleY(1);

      // For arrow blocks, we need to scale only the stem length, not the arrowhead
      if (block.type === "arrow") {
        const arrowBlock = block;

        // Calculate scale based on the bounding box diagonal change
        // This gives us a more accurate scale for the arrow length
        const originalDiagonal = Math.hypot(arrowBlock.width, arrowBlock.height);
        const newDiagonal = Math.hypot(width, height);
        const scale = originalDiagonal > 0 ? newDiagonal / originalDiagonal : 1;

        // Scale the arrow points (stem length only, arrowhead size stays constant)
        const newPoints = scaleArrowPoints(arrowBlock, scale);

        // Create a temporary block with new points to calculate new bounds
        const tempBlock: IEditorBlockArrow = {
          ...arrowBlock,
          points: newPoints,
        };
        const newBounds = calculateArrowBounds(tempBlock);

        // Convert Group position back to block position
        const blockPos = groupPositionToBlockPosition(node.x(), node.y(), tempBlock);

        // Keep arrowhead size constant - don't update pointerLength or pointerWidth
        updateBlockValues(id, {
          height: newBounds.height,
          points: newPoints,
          rotation,
          width: newBounds.width,
          x: blockPos.x,
          y: blockPos.y,
        });
      } else if (block.type === "draw") {
        const drawBlock = block;
        const scaledPoints = drawBlock.points.map((value, index) =>
          index % 2 === 0 ? value * scaleX : value * scaleY,
        );

        updateBlockValues(id, {
          height,
          points: scaledPoints,
          rotation,
          scaleX: 1,
          scaleY: 1,
          width,
          x: node.x(),
          y: node.y(),
        });
      } else {
        updateBlockValues(id, {
          height,
          rotation,
          width,
          x: node.x(),
          y: node.y(),
        });
      }
    }
  }, [updateBlockValues, blocks]);

  const handleStartTextEdit = React.useCallback(
    (block: IEditorBlockText) => {
      const container = containerRef.current;
      const stage = stageRef.current;
      if (!container || !stage) {
        return;
      }
      const rect = container.getBoundingClientRect();
      const position = stagePosition ?? stage.position();
      const scale = zoom;
      setEditingText({
        clientX: rect.left + position.x + block.x * scale,
        clientY: rect.top + position.y + block.y * scale,
        height: block.height * scale,
        id: block.id,
        scale,
        value: block.text,
        width: block.width * scale,
      });
      setIsTextEditing(true);
      setSelectedIds([block.id]);
    },
    [setIsTextEditing, setSelectedIds, stagePosition, zoom],
  );

  const commitTextEdit = React.useCallback(() => {
    if (!editingText) {
      return;
    }
    const block = editorStoreApi.getState().blocksById[editingText.id];
    if (!block || block.type !== "text") {
      setEditingText(null);
      setIsTextEditing(false);
      return;
    }
    const { value } = editingText;
    const lines = value.split(/\n/u).length;
    const newHeight = Math.max(block.lineHeight, lines * block.lineHeight);
    updateBlockValues(block.id, {
      height: newHeight,
      text: value,
    });
    setEditingText(null);
    setIsTextEditing(false);
  }, [editingText, setIsTextEditing, updateBlockValues]);

  const zoomIn = React.useCallback(() => {
    applyZoom(zoom * ZOOM_STEP);
  }, [applyZoom, zoom]);

  const zoomOut = React.useCallback(() => {
    applyZoom(zoom / ZOOM_STEP);
  }, [applyZoom, zoom]);

  const resetZoom = React.useCallback(() => {
    applyZoom(1, { x: containerSize.width / 2, y: containerSize.height / 2 });
  }, [applyZoom, containerSize.height, containerSize.width]);

  const editingBlock = React.useMemo(() => {
    if (!editingText) {
      return null;
    }
    return selectTextBlock(editingText.id)(editorStoreApi.getState()) ?? null;
  }, [editingText]);

  return (
    <div ref={containerRef} className="relative flex-1 canvas-stage">
      <Stage
        ref={handleStageRef}
        width={containerSize.width}
        height={containerSize.height}
        scaleX={zoom}
        scaleY={zoom}
        x={stagePosition?.x ?? 0}
        y={stagePosition?.y ?? 0}
        draggable={isMoveMode && !isTextEditing}
        onDragStart={handleStageDragStart}
        onDragMove={handleStageDragMove}
        onDragEnd={handleStageDragEnd}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={handleStageClick}
        onWheel={handleWheel}
        onMouseLeave={() => setHoveredId(null)}
        style={{ cursor: stageCursor(isMoveMode, isTextEditing, isStageDragging) }}
      >
        <Layer listening={false}>
          <Rect
            x={0}
            y={0}
            width={size.width}
            height={size.height}
            {...backgroundFillProps(background, size)}
            stroke="#d4d4d8"
            strokeWidth={1}
          />
        </Layer>

        <Layer listening={false}>
          {isDrawing && drawingPreview ? (
            <Group x={drawingPreview.bounds.minX} y={drawingPreview.bounds.minY} listening={false}>
              <KonvaLine
                points={drawingPreview.points}
                stroke="#000000"
                strokeWidth={3}
                tension={0}
                lineCap="round"
                lineJoin="round"
                perfectDrawEnabled={false}
              />
            </Group>
          ) : null}
        </Layer>

        <Layer>
          {blocks.map((block) => {
            const handleHover = (hovering: boolean) => {
              if (!isSelectMode) {
                return;
              }
              if (hovering) {
                setHoveredId(block.id);
              } else if (hoveredId === block.id) {
                setHoveredId(null);
              }
            };

            const dragHandlers = {
              draggable: isSelectMode && !isTextEditing,
              onDragEnd: (position: { x: number; y: number }) =>
                handleNodeDragEnd(block.id, position),
              onDragStart: (evt: KonvaEventObject<DragEvent>) => {
                evt.cancelBubble = true;
                if (!isSelectMode) {
                  return;
                }
                setHoveredId(block.id);
                updateSelection((current) => {
                  if (current.includes(block.id)) {
                    return current;
                  }
                  return [block.id];
                });

                // Check if Alt key is pressed
                const isAltPressed = evt.evt.altKey;
                if (isAltPressed) {
                  isAltDragRef.current = true;
                  // Store original positions of all selected blocks
                  // Get current selected IDs from store to ensure we have the latest state
                  const currentSelectedIds = editorStoreApi
                    .getState()
                    .selectedIds.includes(block.id)
                    ? editorStoreApi.getState().selectedIds
                    : [block.id];
                  originalPositionsRef.current.clear();
                  for (const selectedId of currentSelectedIds) {
                    const selectedBlock = blocks.find((b) => b.id === selectedId);
                    if (selectedBlock) {
                      if (selectedBlock.type === "arrow") {
                        const arrowBlock = selectedBlock;
                        // For arrows, we need to get the Group position
                        const groupPos = blockPositionToGroupPosition(
                          arrowBlock.x,
                          arrowBlock.y,
                          arrowBlock,
                        );
                        originalPositionsRef.current.set(selectedId, {
                          x: groupPos.x,
                          y: groupPos.y,
                        });
                      } else {
                        originalPositionsRef.current.set(selectedId, {
                          x: selectedBlock.x,
                          y: selectedBlock.y,
                        });
                      }
                    }
                  }
                } else {
                  isAltDragRef.current = false;
                  originalPositionsRef.current.clear();
                }
              },
              onHover: handleHover,
            };
            const handleBlockClick = (evt: KonvaEventObject<MouseEvent | TouchEvent>) =>
              handleNodeSelection(block, evt);

            const isPreviewed =
              !selectedIds.includes(block.id) && previewSelectionIds.includes(block.id);

            let content: React.ReactNode = null;
            if (block.type === "frame") {
              content = (
                <FrameNode
                  key={block.id}
                  block={block}
                  onClick={handleBlockClick}
                  {...dragHandlers}
                />
              );
            } else if (block.type === "text") {
              content = (
                <Group key={block.id}>
                  <TextNode
                    block={block}
                    {...dragHandlers}
                    onClick={(evt) => {
                      if (evt.evt.detail === 2) {
                        handleStartTextEdit(block);
                        return;
                      }
                      handleNodeSelection(block, evt);
                    }}
                  />
                </Group>
              );
            } else if (block.type === "image") {
              content = (
                <ImageNode
                  key={block.id}
                  block={block}
                  onClick={handleBlockClick}
                  {...dragHandlers}
                />
              );
            } else if (block.type === "arrow") {
              content = (
                <ArrowNode
                  key={block.id}
                  block={block}
                  onClick={handleBlockClick}
                  {...dragHandlers}
                />
              );
            } else if (block.type === "draw") {
              content = (
                <DrawNode
                  key={block.id}
                  block={block}
                  onClick={handleBlockClick}
                  {...dragHandlers}
                />
              );
            } else if (block.type === "html") {
              content = (
                <HtmlNode
                  key={block.id}
                  block={block}
                  onClick={handleBlockClick}
                  {...dragHandlers}
                  isSelecting={isSelecting}
                />
              );
            }

            if (!content) {
              return null;
            }

            return (
              <React.Fragment key={block.id}>
                {content}
                {isPreviewed && isSelectMode ? <HoverOutline block={block} zoom={zoom} /> : null}
              </React.Fragment>
            );
          })}

          {hoveredId && isSelectMode
            ? (() => {
                const block = blocks.find((item) => item.id === hoveredId);
                if (!block || selectedIds.includes(block.id)) {
                  return null;
                }
                return <HoverOutline block={block} zoom={zoom} />;
              })()
            : null}
        </Layer>

        <Layer listening={false}>
          <SelectionOutline rect={selectionRect} zoom={zoom} />
          {isPlacingBlock && placementStart && placementHasMoved && placementMode ? (
            <PlacementPreview
              mode={placementMode}
              start={placementStart}
              current={placementCurrent}
              zoom={zoom}
              pendingImageData={pendingImageData}
            />
          ) : null}
        </Layer>
        <Layer>
          {selectedIds.length > 0 && !isTextEditing ? (
            <Transformer
              ref={transformerRef}
              rotateEnabled
              onTransform={handleTransform}
              onTransformEnd={handleTransformEnd}
              enabledAnchors={[
                "top-left",
                "top-center",
                "top-right",
                "middle-left",
                "middle-right",
                "bottom-left",
                "bottom-center",
                "bottom-right",
              ]}
            />
          ) : null}
        </Layer>
      </Stage>

      {editingText && editingBlock ? (
        <textarea
          style={{
            background: "white",
            border: "1px solid #4f46e5",
            color: editingBlock.color,
            fontFamily: editingBlock.font.family,
            fontSize: `${editingBlock.fontSize}px`,
            fontWeight: editingBlock.font.weight,
            left: editingText.clientX,
            lineHeight: `${editingBlock.lineHeight}px`,
            minHeight: editingText.height,
            outline: "none",
            padding: "8px",
            position: "fixed",
            top: editingText.clientY,
            transformOrigin: "left top",
            width: editingText.width,
            zIndex: 30,
          }}
          value={editingText.value}
          onChange={(event) =>
            setEditingText((prev) => (prev ? { ...prev, value: event.target.value } : prev))
          }
          onBlur={commitTextEdit}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setEditingText(null);
              setIsTextEditing(false);
            }
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              commitTextEdit();
            }
          }}
          autoFocus
        />
      ) : null}

      <ZoomHandler zoomIn={zoomIn} zoomOut={zoomOut} resetZoom={resetZoom} />
    </div>
  );
};

export default EditorCanvas;
