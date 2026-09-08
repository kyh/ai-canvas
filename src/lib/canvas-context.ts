import type { IEditorBlocks, IEditorSize } from "./schema";
import type { SelectionBounds } from "./types";

/**
 * Per-turn client context sent alongside every AI request via eve's
 * `send({ clientContext })`. The agent's instructions.md documents this
 * exact shape; the values are JSON-serialized into a user-role context
 * message for the next model call only (never persisted).
 */
// oxlint-disable-next-line typescript/consistent-type-definitions -- eve's JsonObject needs the implicit index signature only a type alias has
export type CanvasContext = {
  canvasSize: IEditorSize;
  background: string | null;
  selectionBounds: SelectionBounds | null;
  selectedBlocks: SelectedBlockDescription[];
};

/** Compact, JSON-safe description of one selected block for the model. */
// oxlint-disable-next-line typescript/consistent-type-definitions -- see CanvasContext
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
    height: block.height,
    id: block.id,
    label: block.label,
    opacity: block.opacity,
    rotation: block.rotation,
    type: block.type,
    visible: block.visible,
    width: block.width,
    x: block.x,
    y: block.y,
  };
  switch (block.type) {
    case "text": {
      return { ...base, color: block.color, fontSize: block.fontSize, text: block.text };
    }
    case "frame": {
      const description = { ...base };
      if (block.background !== undefined) {
        description.background = block.background;
      }
      return description;
    }
    case "image": {
      // Deliberately omit `url` — generated images are multi-hundred-KB data: URLs.
      const description = { ...base };
      if (block.prompt !== undefined) {
        description.prompt = block.prompt;
      }
      return description;
    }
    case "html": {
      return { ...base, htmlLength: block.html.length };
    }
    default: {
      return base;
    }
  }
};

export const buildCanvasContext = (input: {
  canvasSize: IEditorSize;
  background: string | undefined;
  selectionBounds: SelectionBounds | null;
  blocks: IEditorBlocks[];
  selectedIds: string[];
}): CanvasContext => ({
  background: input.background ?? null,
  canvasSize: input.canvasSize,
  selectedBlocks: input.blocks
    .filter((block) => input.selectedIds.includes(block.id))
    .map(describeBlock),
  selectionBounds: input.selectionBounds,
});
