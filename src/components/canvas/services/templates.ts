import { templateSchema, blockSchema } from "@/lib/schema";
import type { IEditorBlocks, IEditorSize, Template } from "@/lib/schema";

export const DEFAULT_CANVAS_SIZE: IEditorSize = { height: 720, width: 1280 };
export const MAX_IMAGE_DIMENSION = 640;

export const ensureBlockDefaults = (block: IEditorBlocks): IEditorBlocks => ({
  ...block,
  opacity: block.opacity ?? 100,
  rotation: block.rotation ?? 0,
  scaleX: block.scaleX ?? 1,
  scaleY: block.scaleY ?? 1,
  visible: block.visible ?? true,
});

export const parseTemplate = (template?: Template) => {
  const validated = template ? templateSchema.parse(template) : undefined;
  const canvasSize = validated?.size ?? DEFAULT_CANVAS_SIZE;
  const background = validated?.background ?? "#ffffff";
  const blocks = (validated?.blocks ?? []).map(ensureBlockDefaults);
  const blockOrder = blocks.map((block) => block.id);
  const blocksById: Record<string, IEditorBlocks> = {};
  for (const block of blocks) {
    blocksById[block.id] = block;
  }

  return {
    background,
    blockOrder,
    blocks,
    blocksById,
    canvasSize,
  };
};

export const parseBlock = (block: IEditorBlocks) => ensureBlockDefaults(blockSchema.parse(block));
