import type { IEditorBlocks, IEditorSize } from "./schema";
import type { SelectionBounds } from "./types";

/**
 * Per-turn client context sent alongside every AI request via eve's
 * `send({ clientContext })`. The agent's instructions.md documents this
 * exact shape; the values are JSON-serialized into a user-role context
 * message for the next model call only (never persisted).
 */
export type CanvasContext = {
  canvasSize: IEditorSize;
  background: string | null;
  selectionBounds: SelectionBounds | null;
  selectedBlocks: SelectedBlockDescription[];
};

/** Compact, JSON-safe description of one selected block for the model. */
export type SelectedBlockDescription = {
  id: string;
  type: IEditorBlocks["type"];
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  text?: string;
  color?: string;
  fontSize?: number;
  background?: string;
  prompt?: string;
  /** html blocks: markup size instead of the (potentially huge) markup itself */
  htmlLength?: number;
};

const describeBlock = (block: IEditorBlocks): SelectedBlockDescription => {
  const base: SelectedBlockDescription = {
    id: block.id,
    type: block.type,
    label: block.label,
    x: block.x,
    y: block.y,
    width: block.width,
    height: block.height,
    rotation: block.rotation,
    opacity: block.opacity,
    visible: block.visible,
  };
  switch (block.type) {
    case "text":
      return { ...base, text: block.text, color: block.color, fontSize: block.fontSize };
    case "frame":
      return {
        ...base,
        ...(block.background !== undefined ? { background: block.background } : {}),
      };
    case "image":
      // Deliberately omit `url` — generated images are multi-hundred-KB data: URLs.
      return { ...base, ...(block.prompt !== undefined ? { prompt: block.prompt } : {}) };
    case "html":
      return { ...base, htmlLength: block.html.length };
    default:
      return base;
  }
};

export const buildCanvasContext = (input: {
  canvasSize: IEditorSize;
  background: string | undefined;
  selectionBounds: SelectionBounds | null;
  blocks: IEditorBlocks[];
  selectedIds: string[];
}): CanvasContext => ({
  canvasSize: input.canvasSize,
  background: input.background ?? null,
  selectionBounds: input.selectionBounds,
  selectedBlocks: input.blocks
    .filter((block) => input.selectedIds.includes(block.id))
    .map(describeBlock),
});
