import {
  Box as BoxIcon,
  Image as ImageIcon,
  Type as TextIcon,
  ArrowRight as ArrowRightIcon,
  Code as CodeIcon,
  Pencil,
} from "lucide-react";
import type { IEditorBlockType } from "@/lib/schema";

export const BlockIcon = ({ type }: { type: IEditorBlockType }) => {
  switch (type) {
    case "text": {
      return <TextIcon />;
    }
    case "frame": {
      return <BoxIcon />;
    }
    case "image": {
      return <ImageIcon />;
    }
    case "arrow": {
      return <ArrowRightIcon />;
    }
    case "html": {
      return <CodeIcon />;
    }
    case "draw": {
      return <Pencil className="h-4 w-4" />;
    }
    default: {
      return <BoxIcon />;
    }
  }
};

export const blockNodeId = (blockId: string) => `block-${blockId}`;

export const calculateDefaultZoom = (
  canvasWidth: number,
  canvasHeight: number,
  container: HTMLDivElement,
) => {
  const containerWidth = container.clientWidth - 50;
  const containerHeight = container.clientHeight - 50;

  if (
    containerWidth <= 0 ||
    containerHeight <= 0 ||
    canvasWidth < containerWidth ||
    canvasHeight < containerHeight
  ) {
    return 1;
  }

  const widthRatio = containerWidth / canvasWidth;
  const heightRatio = containerHeight / canvasHeight;

  // Calculate the minimum ratio to fit the canvas in the container
  const minRatio = Math.min(widthRatio, heightRatio);

  // Calculate the default zoom level
  const defaultZoom = Math.floor(minRatio * 100);

  return defaultZoom / 100;
};

const splitGradientArgs = (input: string) => {
  const args: string[] = [];
  let buffer = "";
  let depth = 0;
  for (const char of input) {
    if (char === "(") {
      depth += 1;
      buffer += char;
      continue;
    }
    if (char === ")") {
      depth = Math.max(0, depth - 1);
      buffer += char;
      continue;
    }
    if (char === "," && depth === 0) {
      args.push(buffer.trim());
      buffer = "";
      continue;
    }
    buffer += char;
  }
  if (buffer.trim()) {
    args.push(buffer.trim());
  }
  return args;
};

const parseStop = (value: string, index: number, total: number) => {
  const colorMatch = value.match(
    /(?:rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|hsl\([^)]+\)|hsla\([^)]+\)|[a-zA-Z]+)/u,
  );
  const color = colorMatch ? colorMatch[0].trim() : value.trim();
  const remainder = value.replace(color, "").trim();
  let offset: number;
  if (remainder.endsWith("%")) {
    offset = Number(remainder.slice(0, -1)) / 100;
  } else if (remainder.length === 0) {
    offset = total === 1 ? 0 : index / (total - 1);
  } else {
    offset = Number(remainder);
    if (Number.isNaN(offset)) {
      offset = total === 1 ? 0 : index / (total - 1);
    }
  }
  return { color, offset: Math.min(Math.max(offset, 0), 1) } as const;
};

const angleToPoints = (angleDeg: number, width: number, height: number) => {
  const angleRad = ((90 - angleDeg) * Math.PI) / 180;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const diagonal = Math.hypot(width, height);
  const distance = diagonal / 2;
  const dx = Math.cos(angleRad) * distance;
  const dy = Math.sin(angleRad) * distance;
  return {
    end: { x: halfWidth + dx, y: halfHeight + dy },
    start: { x: halfWidth - dx, y: halfHeight - dy },
  };
};

const DIRECTION_ANGLES = new Map([
  ["right", 90],
  ["left", 270],
  ["bottom", 180],
  ["top", 0],
  ["top right", 45],
  ["right top", 45],
  ["bottom right", 135],
  ["right bottom", 135],
  ["bottom left", 225],
  ["left bottom", 225],
  ["top left", 315],
  ["left top", 315],
]);

export const parseLinearGradientFill = (value: string, width: number, height: number) => {
  const inner = value.match(/linear-gradient\((?<inner>.*)\)/iu)?.groups?.inner;
  if (inner === undefined) {
    return { fill: value };
  }
  const parts = splitGradientArgs(inner);
  if (!parts.length) {
    return { fill: value };
  }
  let angle = 180;
  const [first] = parts;
  const direction = first.match(/^to\s+(?<direction>[a-z\s]+)/iu)?.groups?.direction;
  if (direction === undefined) {
    const angleValue = first.match(/(?<angle>-?\d+(?:\.\d+)?)deg/u)?.groups?.angle;
    if (angleValue !== undefined) {
      angle = Number(angleValue);
      parts.shift();
    }
  } else {
    angle = DIRECTION_ANGLES.get(direction.trim().toLowerCase()) ?? angle;
    parts.shift();
  }
  const stops = parts.length ? parts : [first];
  const parsedStops = stops.map((stop, index) => parseStop(stop, index, stops.length));
  const colorStops: (number | string)[] = [];
  for (const stop of parsedStops) {
    colorStops.push(stop.offset, stop.color);
  }
  const { start, end } = angleToPoints(angle, width, height);
  return {
    fillLinearGradientColorStops: colorStops,
    fillLinearGradientEndPoint: end,
    fillLinearGradientStartPoint: start,
  } as const;
};
