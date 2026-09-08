"use client";

import type Konva from "konva";
import { create } from "zustand";
import { generateId } from "@/lib/id-generator";
import type {
  IEditorBlockFrame,
  IEditorBlockImage,
  IEditorBlockText,
  IEditorBlockArrow,
  IEditorBlocks,
  IEditorSize,
  Template,
} from "@/lib/schema";
import {
  blockSchema,
  frameBlockSchema,
  imageBlockSchema,
  textBlockSchema,
  arrowBlockSchema,
} from "@/lib/schema";
import { loadFontsForBlocks } from "./services/fonts";
import { downloadStageAsImage, exportCanvasAsJson } from "./services/export";
import {
  ensureBlockDefaults,
  parseBlock,
  parseTemplate,
  MAX_IMAGE_DIMENSION,
} from "./services/templates";
import { centerBlockInViewport, centerStageWithinContainer } from "./utils/canvas-math";
import { calculateArrowBounds } from "./utils/arrow-bounds";

type HistoryEntry = Pick<Template, "blocks" | "size" | "background">;

interface EditorCanvasState {
  size: IEditorSize;
  background?: string;
  mode: "move" | "select" | "text" | "frame" | "arrow" | "image" | "draw";
  isTextEditing: boolean;
  zoom: number;
  stagePosition: { x: number; y: number };
  containerSize: { width: number; height: number };
  hasCentered: boolean;
}

interface EditorState {
  blocksById: Record<string, IEditorBlocks>;
  blockOrder: string[];
  selectedIds: string[];
  hoveredId: string | null;
  canvas: EditorCanvasState;
  history: {
    undo: HistoryEntry[];
    redo: HistoryEntry[];
  };
  stage: Konva.Stage | null;
  pendingImageData: { url: string; width: number; height: number } | null;
  clipboard: IEditorBlocks[] | null;
}

interface EditorActions {
  setStage: (stage: Konva.Stage | null) => void;
  setSelectedIds: (ids: string[]) => void;
  setMode: (mode: "move" | "select" | "text" | "frame" | "arrow" | "image" | "draw") => void;
  setIsTextEditing: (value: boolean) => void;
  setStageZoom: (zoom: number) => void;
  setStagePosition: (position: { x: number; y: number }) => void;
  setCanvasContainerSize: (size: { width: number; height: number }) => void;
  centerStage: () => void;
  updateCanvasSize: (size: Partial<IEditorSize>) => void;
  setCanvasBackground: (background: string | undefined) => void;
  setHoveredId: (id: string | null) => void;
  setPendingImageData: (data: { url: string; width: number; height: number } | null) => void;
  addTextBlock: () => void;
  addFrameBlock: () => void;
  addImageBlock: (args: { url: string; width: number; height: number }) => void;
  addArrowBlock: () => void;
  duplicateBlock: (id: string) => void;
  deleteBlock: (id: string) => void;
  deleteSelectedBlocks: () => void;
  showHideBlock: (id: string) => void;
  updateBlockValues: (id: string, values: Partial<IEditorBlocks>) => void;
  bringForwardBlock: (id: string) => void;
  bringToTopBlock: (id: string) => void;
  bringBackwardBlock: (id: string) => void;
  bringToBackBlock: (id: string) => void;
  setBlockPosition: (id: string, position: { x: number; y: number }) => void;
  setBlockSize: (id: string, size: { width?: number | null; height?: number | null }) => void;
  addBlock: (block: IEditorBlocks) => void;
  loadTemplate: (template: Template) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  downloadImage: () => Promise<void>;
  exportToJson: () => void;
  copySelectedBlocks: () => void;
  pasteBlocks: (position?: { x: number; y: number }) => void;
}

export type EditorStore = EditorState & EditorActions;

const clone = <T>(value: T): T => structuredClone(value);

const createSnapshot = (state: EditorState): HistoryEntry => ({
  background: state.canvas.background,
  blocks: state.blockOrder
    .map((id) => state.blocksById[id])
    .filter(Boolean)
    .map((block) => clone(block)),
  size: clone(state.canvas.size),
});

export const selectOrderedBlocks = (state: EditorState): IEditorBlocks[] =>
  state.blockOrder.map((id) => state.blocksById[id]).filter(Boolean);

/**
 * Narrow a stored block to a text block. `blocksById` holds the full
 * `blockSchema` discriminated union, so text controls have to check the
 * discriminant rather than assert — an id can address a block of any type, and
 * a stale id after a delete/replace addresses none.
 */
export const selectTextBlock =
  (blockId: string) =>
  (state: EditorState): IEditorBlockText | undefined => {
    const block = state.blocksById[blockId];
    return block?.type === "text" ? block : undefined;
  };

const blocksArray = selectOrderedBlocks;

const calculateViewportCenteredPosition = (state: EditorState, width: number, height: number) =>
  centerBlockInViewport(
    {
      canvasSize: state.canvas.size,
      containerSize: state.canvas.containerSize,
      stage: state.stage,
      stagePosition: state.canvas.stagePosition,
      zoom: state.canvas.zoom || 1,
    },
    width,
    height,
  );

const computeCenteredStagePosition = (state: EditorState) => {
  const {
    canvas: { size, containerSize, zoom },
  } = state;
  if (!containerSize.width || !containerSize.height || !size.width || !size.height) {
    return null;
  }
  return centerStageWithinContainer({
    canvasSize: size,
    containerSize,
    zoom: zoom || 1,
  });
};

const buildInitialState = (template?: Template): EditorState => {
  const { canvasSize, background, blocksById, blockOrder } = parseTemplate(template);

  return {
    blockOrder,
    blocksById,
    canvas: {
      background,
      containerSize: { height: 0, width: 0 },
      hasCentered: false,
      isTextEditing: false,
      mode: "select",
      size: canvasSize,
      stagePosition: { x: 0, y: 0 },
      zoom: 1,
    },
    clipboard: null,
    history: {
      redo: [],
      undo: [],
    },
    hoveredId: null,
    pendingImageData: null,
    selectedIds: [],
    stage: null,
  };
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...buildInitialState(),

  addArrowBlock: () => {
    set((state) => {
      const snapshot = createSnapshot(state);
      const blocks = blocksArray(state);

      // Default arrow: horizontal, 200px long, pointing right
      const points: [number, number, number, number] = [0, 0, 200, 0];

      // Create a temporary block to calculate bounds
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
        x: 0,
        y: 0,
      };

      const bounds = calculateArrowBounds(tempBlock);

      // Calculate centered position for the bounding box
      const position = calculateViewportCenteredPosition(state, bounds.width, bounds.height);

      // Convert bounding box position to block position (accounting for offset)
      const actualX = position.x - bounds.offsetX;
      const actualY = position.y - bounds.offsetY;

      const defaultBlock = ensureBlockDefaults(
        arrowBlockSchema.parse({
          fill: "#000000",
          height: bounds.height,
          id: generateId(),
          label: `Arrow ${blocks.length + 1}`,
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
          width: bounds.width,
          x: actualX,
          y: actualY,
        } satisfies IEditorBlockArrow),
      );

      return {
        ...state,
        blockOrder: [...state.blockOrder, defaultBlock.id],
        blocksById: {
          ...state.blocksById,
          [defaultBlock.id]: defaultBlock,
        },
        canvas: { ...state.canvas, mode: "select" },
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
        selectedIds: [defaultBlock.id],
      };
    });
  },

  addBlock: (block) => {
    set((state) => {
      const snapshot = createSnapshot(state);
      const parsed = parseBlock(block);
      return {
        ...state,
        blockOrder: [...state.blockOrder, parsed.id],
        blocksById: {
          ...state.blocksById,
          [parsed.id]: parsed,
        },
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
        selectedIds: [parsed.id],
      };
    });
  },

  addFrameBlock: () => {
    set((state) => {
      const snapshot = createSnapshot(state);
      const blocks = blocksArray(state);
      const position = calculateViewportCenteredPosition(state, 240, 240);
      const defaultBlock = ensureBlockDefaults(
        frameBlockSchema.parse({
          id: generateId(),
          label: `Frame ${blocks.length + 1}`,
          type: "frame",
          ...position,
          background: "#ffffff",
          border: {
            color: "#d1d5db",
            width: 1,
          },
          height: 240,
          opacity: 100,
          radius: { bl: 16, br: 16, tl: 16, tr: 16 },
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          visible: true,
          width: 240,
        } satisfies IEditorBlockFrame),
      );

      return {
        ...state,
        blockOrder: [...state.blockOrder, defaultBlock.id],
        blocksById: {
          ...state.blocksById,
          [defaultBlock.id]: defaultBlock,
        },
        canvas: { ...state.canvas, mode: "select" },
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
        selectedIds: [defaultBlock.id],
      };
    });
  },

  addImageBlock: ({ url, width, height }) => {
    set((state) => {
      const snapshot = createSnapshot(state);
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));
      const scaledWidth = Math.max(1, Math.round(width * scale));
      const scaledHeight = Math.max(1, Math.round(height * scale));
      const blocks = blocksArray(state);
      const position = calculateViewportCenteredPosition(state, scaledWidth, scaledHeight);

      const defaultBlock = ensureBlockDefaults(
        imageBlockSchema.parse({
          id: generateId(),
          label: `Image ${blocks.length + 1}`,
          type: "image",
          ...position,
          fit: "contain",
          height: scaledHeight,
          opacity: 100,
          position: "center",
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          url,
          visible: true,
          width: scaledWidth,
        } satisfies IEditorBlockImage),
      );

      return {
        ...state,
        blockOrder: [...state.blockOrder, defaultBlock.id],
        blocksById: {
          ...state.blocksById,
          [defaultBlock.id]: defaultBlock,
        },
        canvas: { ...state.canvas, mode: "select" },
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
        selectedIds: [defaultBlock.id],
      };
    });
  },

  addTextBlock: () => {
    set((state) => {
      const snapshot = createSnapshot(state);
      const blocks = blocksArray(state);
      const position = calculateViewportCenteredPosition(state, 320, 52);
      const defaultBlock = ensureBlockDefaults(
        textBlockSchema.parse({
          id: generateId(),
          label: `Text ${blocks.length + 1}`,
          type: "text",
          ...position,
          color: "#1f2933",
          font: { family: "Poppins", weight: "500" },
          fontSize: 24,
          height: 52,
          letterSpacing: 0,
          lineHeight: 32,
          opacity: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          text: "New text",
          textAlign: "left",
          visible: true,
          width: 320,
        } satisfies IEditorBlockText),
      );

      return {
        ...state,
        blockOrder: [...state.blockOrder, defaultBlock.id],
        blocksById: {
          ...state.blocksById,
          [defaultBlock.id]: defaultBlock,
        },
        canvas: { ...state.canvas, mode: "select" },
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
        selectedIds: [defaultBlock.id],
      };
    });
  },

  bringBackwardBlock: (id) => {
    set((state) => {
      const index = state.blockOrder.indexOf(id);
      if (index <= 0) {
        return state;
      }
      const snapshot = createSnapshot(state);
      const nextOrder = [...state.blockOrder];
      [nextOrder[index], nextOrder[index - 1]] = [nextOrder[index - 1], nextOrder[index]];
      return {
        ...state,
        blockOrder: nextOrder,
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
      };
    });
  },

  bringForwardBlock: (id) => {
    set((state) => {
      const index = state.blockOrder.indexOf(id);
      if (index === -1 || index === state.blockOrder.length - 1) {
        return state;
      }
      const snapshot = createSnapshot(state);
      const nextOrder = [...state.blockOrder];
      [nextOrder[index], nextOrder[index + 1]] = [nextOrder[index + 1], nextOrder[index]];
      return {
        ...state,
        blockOrder: nextOrder,
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
      };
    });
  },

  bringToBackBlock: (id) => {
    set((state) => {
      const index = state.blockOrder.indexOf(id);
      if (index <= 0) {
        return state;
      }
      const snapshot = createSnapshot(state);
      const nextOrder = [...state.blockOrder];
      nextOrder.splice(index, 1);
      nextOrder.unshift(id);
      return {
        ...state,
        blockOrder: nextOrder,
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
      };
    });
  },

  bringToTopBlock: (id) => {
    set((state) => {
      const index = state.blockOrder.indexOf(id);
      if (index === -1 || index === state.blockOrder.length - 1) {
        return state;
      }
      const snapshot = createSnapshot(state);
      const nextOrder = [...state.blockOrder];
      nextOrder.splice(index, 1);
      nextOrder.push(id);
      return {
        ...state,
        blockOrder: nextOrder,
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
      };
    });
  },

  centerStage: () => {
    set((state) => {
      const position = computeCenteredStagePosition(state);
      if (!position) {
        return state;
      }
      const current = state.canvas.stagePosition;
      if (current.x === position.x && current.y === position.y && state.canvas.hasCentered) {
        return state;
      }
      return {
        ...state,
        canvas: {
          ...state.canvas,
          hasCentered: true,
          stagePosition: position,
        },
      };
    });
  },

  copySelectedBlocks: () => {
    set((state) => {
      if (state.selectedIds.length === 0) {
        return state;
      }
      const copiedBlocks = state.selectedIds
        .map((id) => state.blocksById[id])
        .filter(Boolean)
        .map((block) => clone(block));
      return {
        ...state,
        clipboard: copiedBlocks,
      };
    });
  },

  deleteBlock: (id) => {
    set((state) => {
      if (!state.blocksById[id]) {
        return state;
      }
      const snapshot = createSnapshot(state);
      const rest = Object.fromEntries(
        Object.entries(state.blocksById).filter(([blockId]) => blockId !== id),
      );
      const nextOrder = state.blockOrder.filter((blockId) => blockId !== id);
      const nextSelected = state.selectedIds.filter((blockId) => blockId !== id);
      const nextHovered = state.hoveredId === id ? null : state.hoveredId;
      return {
        ...state,
        blockOrder: nextOrder,
        blocksById: rest,
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
        hoveredId: nextHovered,
        selectedIds: nextSelected,
      };
    });
  },

  deleteSelectedBlocks: () => {
    set((state) => {
      if (state.selectedIds.length === 0) {
        return state;
      }
      const snapshot = createSnapshot(state);
      const idsToRemove = new Set(state.selectedIds);
      const nextBlocksById = Object.fromEntries(
        Object.entries(state.blocksById).filter(([blockId]) => !idsToRemove.has(blockId)),
      );
      const nextOrder = state.blockOrder.filter((blockId) => !idsToRemove.has(blockId));
      const nextHovered = idsToRemove.has(state.hoveredId ?? "") ? null : state.hoveredId;
      return {
        ...state,
        blockOrder: nextOrder,
        blocksById: nextBlocksById,
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
        hoveredId: nextHovered,
        selectedIds: [],
      };
    });
  },

  downloadImage: async () => {
    const state = get();
    const { stage, selectedIds } = state;
    if (!stage) {
      return;
    }
    await downloadStageAsImage(stage, blocksArray(state), selectedIds);
  },

  duplicateBlock: (id) => {
    set((state) => {
      const block = state.blocksById[id];
      if (!block) {
        return state;
      }
      const snapshot = createSnapshot(state);
      const newId = generateId();
      const duplicated = parseBlock({
        ...clone(block),
        id: newId,
        label: `${block.label} Copy`,
        x: block.x + 24,
        y: block.y + 24,
      });

      const index = state.blockOrder.indexOf(id);
      const nextOrder = [...state.blockOrder];
      nextOrder.splice(index + 1, 0, newId);

      return {
        ...state,
        blockOrder: nextOrder,
        blocksById: {
          ...state.blocksById,
          [duplicated.id]: duplicated,
        },
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
        selectedIds: [duplicated.id],
      };
    });
  },

  exportToJson: () => {
    const state = get();
    exportCanvasAsJson({
      background: state.canvas.background,
      blocks: blocksArray(state),
      size: state.canvas.size,
    });
  },

  handleRedo: () => {
    set((state) => {
      if (state.history.redo.length === 0) {
        return state;
      }
      const [snapshot, ...remainingRedo] = state.history.redo;
      const undoSnapshot = createSnapshot(state);
      const nextBlocksById: Record<string, IEditorBlocks> = {};
      for (const block of snapshot.blocks) {
        nextBlocksById[block.id] = block;
      }
      const nextOrder = snapshot.blocks.map((block) => block.id);
      const baseState: EditorState = {
        ...state,
        blockOrder: nextOrder,
        blocksById: nextBlocksById,
        canvas: {
          ...state.canvas,
          background: snapshot.background ?? state.canvas.background,
          hasCentered: false,
          size: snapshot.size,
        },
        history: {
          redo: remainingRedo,
          undo: [undoSnapshot, ...state.history.undo],
        },
        selectedIds: [],
      };
      const position = computeCenteredStagePosition(baseState);
      if (!position) {
        return baseState;
      }
      return {
        ...baseState,
        canvas: {
          ...baseState.canvas,
          hasCentered: true,
          stagePosition: position,
        },
      };
    });
  },

  handleUndo: () => {
    set((state) => {
      if (state.history.undo.length === 0) {
        return state;
      }
      const [snapshot, ...remainingUndo] = state.history.undo;
      const redoSnapshot = createSnapshot(state);
      const nextBlocksById: Record<string, IEditorBlocks> = {};
      for (const block of snapshot.blocks) {
        nextBlocksById[block.id] = block;
      }
      const nextOrder = snapshot.blocks.map((block) => block.id);
      const baseState: EditorState = {
        ...state,
        blockOrder: nextOrder,
        blocksById: nextBlocksById,
        canvas: {
          ...state.canvas,
          background: snapshot.background ?? state.canvas.background,
          hasCentered: false,
          size: snapshot.size,
        },
        history: {
          redo: [redoSnapshot, ...state.history.redo],
          undo: remainingUndo,
        },
        selectedIds: [],
      };
      const position = computeCenteredStagePosition(baseState);
      if (!position) {
        return baseState;
      }
      return {
        ...baseState,
        canvas: {
          ...baseState.canvas,
          hasCentered: true,
          stagePosition: position,
        },
      };
    });
  },

  loadTemplate: (template) => {
    set((state) => {
      const snapshot = createSnapshot(state);
      const initial = buildInitialState(template);
      const mergedState: EditorState = {
        ...state,
        blockOrder: initial.blockOrder,
        blocksById: initial.blocksById,
        canvas: {
          ...initial.canvas,
          containerSize: state.canvas.containerSize,
          hasCentered: false,
          stagePosition: state.canvas.stagePosition,
          zoom: state.canvas.zoom,
        },
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
        hoveredId: null,
        selectedIds: initial.selectedIds,
        stage: state.stage,
      };
      const position = computeCenteredStagePosition(mergedState);
      if (!position) {
        return mergedState;
      }
      return {
        ...mergedState,
        canvas: {
          ...mergedState.canvas,
          hasCentered: true,
          stagePosition: position,
        },
      };
    });
  },

  pasteBlocks: (position?: { x: number; y: number }) => {
    set((state) => {
      if (!state.clipboard || state.clipboard.length === 0) {
        return state;
      }
      const snapshot = createSnapshot(state);
      const newBlocks: IEditorBlocks[] = [];
      const newIds: string[] = [];

      // Calculate the minimum x and y from copied blocks to maintain relative positions
      const minX = Math.min(...state.clipboard.map((b) => b.x));
      const minY = Math.min(...state.clipboard.map((b) => b.y));

      // Use pointer position if provided, otherwise use offset from original position
      const pasteX = position?.x ?? minX + 24;
      const pasteY = position?.y ?? minY + 24;

      for (const block of state.clipboard) {
        const newId = generateId();
        const newBlock = parseBlock({
          ...clone(block),
          id: newId,
          label: `${block.label} Copy`,
          x: block.x - minX + pasteX,
          y: block.y - minY + pasteY,
        });
        newBlocks.push(newBlock);
        newIds.push(newId);
      }

      // Add all new blocks
      const newBlocksById = { ...state.blocksById };
      for (const block of newBlocks) {
        newBlocksById[block.id] = block;
      }

      return {
        ...state,
        blockOrder: [...state.blockOrder, ...newIds],
        blocksById: newBlocksById,
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
        selectedIds: newIds,
      };
    });
  },

  setBlockPosition: (id, position) => {
    set((state) => {
      const block = state.blocksById[id];
      if (!block) {
        return state;
      }
      const snapshot = createSnapshot(state);
      const nextBlock = {
        ...block,
        x: Math.round(position.x),
        y: Math.round(position.y),
      };
      return {
        ...state,
        blocksById: {
          ...state.blocksById,
          [id]: nextBlock,
        },
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
      };
    });
  },

  setBlockSize: (id, size) => {
    set((state) => {
      const block = state.blocksById[id];
      if (!block) {
        return state;
      }
      const snapshot = createSnapshot(state);
      const nextBlock = { ...block };
      if (size.width !== null && size.width !== undefined) {
        nextBlock.width = Math.max(1, size.width);
      }
      if (size.height !== null && size.height !== undefined) {
        nextBlock.height = Math.max(1, size.height);
      }
      return {
        ...state,
        blocksById: {
          ...state.blocksById,
          [id]: nextBlock,
        },
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
      };
    });
  },

  setCanvasBackground: (background) => {
    set((state) => {
      const snapshot = createSnapshot(state);
      return {
        ...state,
        canvas: {
          ...state.canvas,
          background,
        },
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
      };
    });
  },

  setCanvasContainerSize: (size) => {
    set((state) => {
      const current = state.canvas.containerSize;
      if (current.width === size.width && current.height === size.height) {
        return state;
      }
      const nextCanvas = {
        ...state.canvas,
        containerSize: size,
      };
      if (state.canvas.hasCentered) {
        return {
          ...state,
          canvas: nextCanvas,
        };
      }
      const position = computeCenteredStagePosition({
        ...state,
        canvas: nextCanvas,
      });
      if (!position) {
        return {
          ...state,
          canvas: nextCanvas,
        };
      }
      return {
        ...state,
        canvas: {
          ...nextCanvas,
          hasCentered: true,
          stagePosition: position,
        },
      };
    });
  },

  setHoveredId: (id) => {
    set((state) => (state.hoveredId === id ? state : { ...state, hoveredId: id }));
  },

  setIsTextEditing: (value) => {
    set((state) =>
      state.canvas.isTextEditing === value
        ? state
        : {
            ...state,
            canvas: { ...state.canvas, isTextEditing: value },
          },
    );
  },

  setMode: (mode) => {
    set((state) => {
      if (state.canvas.mode === mode) {
        return state;
      }
      return {
        ...state,
        canvas: { ...state.canvas, mode },
        hoveredId: null,
        selectedIds: [],
      };
    });
  },

  setPendingImageData: (data) => {
    set((state) => ({
      ...state,
      pendingImageData: data,
    }));
  },

  setSelectedIds: (ids) => {
    set((state) => {
      if (
        state.selectedIds.length === ids.length &&
        state.selectedIds.every((value, index) => value === ids[index])
      ) {
        return state;
      }
      return { ...state, selectedIds: ids };
    });
  },

  setStage: (stage) => {
    set((state) => {
      if (state.stage === stage) {
        return state;
      }
      if (!stage) {
        return { ...state, stage };
      }
      const nextState: EditorState = { ...state, stage };
      if (nextState.canvas.hasCentered) {
        return nextState;
      }
      const position = computeCenteredStagePosition(nextState);
      if (!position) {
        return nextState;
      }
      return {
        ...nextState,
        canvas: {
          ...nextState.canvas,
          hasCentered: true,
          stagePosition: position,
        },
      };
    });
  },

  setStagePosition: (position) => {
    set((state) => {
      const current = state.canvas.stagePosition;
      if (current.x === position.x && current.y === position.y) {
        if (state.canvas.hasCentered) {
          return state;
        }
        return {
          ...state,
          canvas: { ...state.canvas, hasCentered: true },
        };
      }
      return {
        ...state,
        canvas: {
          ...state.canvas,
          hasCentered: true,
          stagePosition: position,
        },
      };
    });
  },

  setStageZoom: (zoom) => {
    set((state) =>
      state.canvas.zoom === zoom ? state : { ...state, canvas: { ...state.canvas, zoom } },
    );
  },

  showHideBlock: (id) => {
    set((state) => {
      const block = state.blocksById[id];
      if (!block) {
        return state;
      }
      const snapshot = createSnapshot(state);
      const nextBlock = { ...block, visible: !block.visible };
      return {
        ...state,
        blocksById: {
          ...state.blocksById,
          [id]: nextBlock,
        },
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
      };
    });
  },

  updateBlockValues: (id, values) => {
    set((state) => {
      const block = state.blocksById[id];
      if (!block) {
        return state;
      }
      const snapshot = createSnapshot(state);
      // `values` is `Partial<IEditorBlocks>`, so a merge can in principle produce a
      // shape that is no longer a legal block (mixed-variant fields). Parse the
      // result rather than assert it; an invalid merge leaves state untouched.
      const merged = blockSchema.safeParse({ ...block, ...values });
      if (!merged.success) {
        return state;
      }
      const nextBlock = ensureBlockDefaults(merged.data);
      return {
        ...state,
        blocksById: {
          ...state.blocksById,
          [id]: nextBlock,
        },
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
      };
    });
  },

  updateCanvasSize: (size) => {
    set((state) => {
      const nextSize = {
        ...state.canvas.size,
        ...size,
      };
      const snapshot = createSnapshot(state);
      const nextCanvas = {
        ...state.canvas,
        hasCentered: false,
        size: nextSize,
      };
      const position = computeCenteredStagePosition({
        ...state,
        canvas: nextCanvas,
      });
      const centeredCanvas = position
        ? {
            ...nextCanvas,
            hasCentered: true,
            stagePosition: position,
          }
        : nextCanvas;
      return {
        ...state,
        canvas: {
          ...centeredCanvas,
        },
        history: {
          redo: [],
          undo: [snapshot, ...state.history.undo],
        },
      };
    });
  },
}));

const selectBlocksForFonts = (state: EditorState) =>
  state.blockOrder.map((id) => state.blocksById[id]).filter(Boolean);

const blocksAreEqual = (prev: IEditorBlocks[], next: IEditorBlocks[]) =>
  prev.length === next.length && prev.every((block, index) => block === next[index]);

// Initialize fonts for initial state (client-side only)
if (typeof window !== "undefined") {
  void loadFontsForBlocks(selectBlocksForFonts(useEditorStore.getState()));

  let prevBlocks = selectBlocksForFonts(useEditorStore.getState());
  useEditorStore.subscribe((state) => {
    const blocks = selectBlocksForFonts(state);
    if (!blocksAreEqual(prevBlocks, blocks)) {
      prevBlocks = blocks;
      void loadFontsForBlocks(blocks);
    }
  });
}

export const editorStoreApi = useEditorStore;

export const initializeEditorStore = (template?: Template) => {
  const initial = buildInitialState(template);
  useEditorStore.setState((state) => {
    const mergedCanvas = {
      ...initial.canvas,
      containerSize: state.canvas.containerSize,
      hasCentered: false,
      stagePosition: state.canvas.stagePosition,
      zoom: state.canvas.zoom,
    };
    const mergedState: EditorState = {
      ...state,
      blockOrder: initial.blockOrder,
      blocksById: initial.blocksById,
      canvas: mergedCanvas,
      history: initial.history,
      hoveredId: initial.hoveredId,
      selectedIds: initial.selectedIds,
      stage: state.stage,
    };
    const position = computeCenteredStagePosition(mergedState);
    if (!position) {
      return mergedState;
    }
    return {
      ...mergedState,
      canvas: {
        ...mergedCanvas,
        hasCentered: true,
        stagePosition: position,
      },
    };
  });
};
