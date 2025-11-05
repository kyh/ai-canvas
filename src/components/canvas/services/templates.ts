import { templateSchema } from "@/lib/schema";
import type { IEditorBlocks, IEditorSize, Template } from "@/lib/schema";
import { blockSchema } from "@/lib/schema";

export const DEFAULT_CANVAS_SIZE: IEditorSize = { width: 1280, height: 720 };
export const MAX_IMAGE_DIMENSION = 640;

export const ensureBlockDefaults = (block: IEditorBlocks): IEditorBlocks => ({
  ...block,
  rotation: block.rotation ?? 0,
  scaleX: block.scaleX ?? 1,
  scaleY: block.scaleY ?? 1,
  visible: block.visible ?? true,
  opacity: block.opacity ?? 100,
});

export const parseTemplate = (template?: Template) => {
  const validated = template ? templateSchema.parse(template) : undefined;
  const canvasSize = validated?.size ?? DEFAULT_CANVAS_SIZE;
  const background = validated?.background ?? "#ffffff";
  const blocks = (validated?.blocks ?? []).map(ensureBlockDefaults);
  const blockOrder = blocks.map((block) => block.id);
  const blocksById = blocks.reduce<Record<string, IEditorBlocks>>(
    (acc, block) => {
      acc[block.id] = block;
      return acc;
    },
    {}
  );

  return {
    canvasSize,
    background,
    blocks,
    blockOrder,
    blocksById,
  };
};

export const parseBlock = (block: IEditorBlocks) =>
  ensureBlockDefaults(blockSchema.parse(block));
