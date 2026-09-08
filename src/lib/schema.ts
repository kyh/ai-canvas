import { z } from "zod";

// ============================================================
// Primitive Schemas & Shared Types
// ============================================================

export const editorSizeSchema = z.object({
  height: z.number(),
  width: z.number(),
});

export const textAlignSchema = z.enum(["center", "left", "right", "justify"]);
export type ITextAlign = z.infer<typeof textAlignSchema>;

export const textTransformSchema = z.enum(["inherit", "capitalize", "uppercase", "lowercase"]);
export type ITextTransform = z.infer<typeof textTransformSchema>;

export const textDecorationSchema = z.enum(["inherit", "overline", "line-through", "underline"]);
export type ITextDecoration = z.infer<typeof textDecorationSchema>;

export const fontSchema = z.object({
  family: z.string(),
  weight: z.string(),
});

const radiusSchema = z
  .object({
    bl: z.number().optional(),
    br: z.number().optional(),
    tl: z.number().optional(),
    tr: z.number().optional(),
  })
  .optional();

const shadowSchema = z
  .object({
    blur: z.number().optional(),
    color: z.string().optional(),
    enabled: z.boolean().optional(),
    offsetX: z.number().optional(),
    offsetY: z.number().optional(),
  })
  .optional();

const borderSchema = z
  .object({
    color: z.string().optional(),
    dash: z.array(z.number()).optional(),
    width: z.number().optional(),
  })
  .optional();

const flipSchema = z
  .object({
    horizontal: z.boolean().optional(),
    vertical: z.boolean().optional(),
  })
  .optional();

// ============================================================
// Block Schemas
// ============================================================

export const blockBaseSchema = z.object({
  background: z.string().optional(),
  border: borderSchema,
  flip: flipSchema,
  height: z.number(),
  id: z.string(),
  label: z.string(),
  locked: z.boolean().optional(),
  opacity: z.number(),
  radius: radiusSchema,
  rotation: z.number().default(0),
  scaleX: z.number().default(1),
  scaleY: z.number().default(1),
  shadow: shadowSchema,
  type: z.enum(["text", "frame", "image", "arrow", "html"]),
  visible: z.boolean(),
  width: z.number(),
  x: z.number(),
  y: z.number(),
});

export const textBlockSchema = blockBaseSchema.extend({
  color: z.string(),
  font: fontSchema,
  fontSize: z.number(),
  letterSpacing: z.number(),
  lineHeight: z.number(),
  text: z.string(),
  textAlign: textAlignSchema,
  textDecoration: textDecorationSchema.optional(),
  textTransform: textTransformSchema.optional(),
  type: z.literal("text"),
});

export const frameBlockSchema = blockBaseSchema.extend({
  type: z.literal("frame"),
});

export const imageBlockSchema = blockBaseSchema.extend({
  fit: z.enum(["contain", "cover", "fill", "fitWidth", "fitHeight"]).default("contain").optional(),
  position: z.enum(["center", "top", "bottom", "left", "right"]).default("center").optional(),
  prompt: z.string().optional(),
  type: z.literal("image"),
  url: z.string(),
});

export const arrowBlockSchema = blockBaseSchema.extend({
  fill: z.string().optional(),
  pointerLength: z.number().default(20),
  pointerWidth: z.number().default(20),
  // [x1, y1, x2, y2] relative to block position
  points: z.array(z.number()).length(4),
  stroke: z.string().optional(),
  strokeWidth: z.number().default(4),
  type: z.literal("arrow"),
});

export const htmlBlockSchema = blockBaseSchema.extend({
  html: z.string(),
  type: z.literal("html"),
});

export const drawBlockSchema = blockBaseSchema.extend({
  points: z.array(z.number()).min(4),
  stroke: z.string().default("#000000"),
  strokeWidth: z.number().default(3),
  tension: z.number().default(0),
  type: z.literal("draw"),
});

export const blockSchema = z.discriminatedUnion("type", [
  textBlockSchema,
  frameBlockSchema,
  imageBlockSchema,
  arrowBlockSchema,
  htmlBlockSchema,
  drawBlockSchema,
]);

export const textBlockSchemaWithoutId = textBlockSchema.omit({ id: true });
export const frameBlockSchemaWithoutId = frameBlockSchema.omit({ id: true });
export const imageBlockSchemaWithoutId = imageBlockSchema.omit({ id: true });
export const arrowBlockSchemaWithoutId = arrowBlockSchema.omit({ id: true });
export const htmlBlockSchemaWithoutId = htmlBlockSchema.omit({ id: true });

// ============================================================
// Template / Canvas Schemas
// ============================================================

export const canvasStateSchema = z.object({
  background: z.string().optional(),
  isTextEditing: z.boolean(),
  mode: z.enum(["move", "select", "text", "frame", "arrow", "image", "draw"]),
  size: editorSizeSchema,
  stagePosition: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
  zoom: z.number(),
});

export const templateSchema = z.object({
  background: z.string().optional(),
  blocks: z.array(blockSchema),
  size: editorSizeSchema,
});

// ============================================================
// Types
// ============================================================

export type IEditorSize = z.infer<typeof editorSizeSchema>;
export type IEditorBlock = z.infer<typeof blockSchema>;
export type IEditorBlocks = z.infer<typeof blockSchema>;
export type IEditorBlockText = z.infer<typeof textBlockSchema>;
export type IEditorBlockFrame = z.infer<typeof frameBlockSchema>;
export type IEditorBlockImage = z.infer<typeof imageBlockSchema>;
export type IEditorBlockArrow = z.infer<typeof arrowBlockSchema>;
export type IEditorBlockHtml = z.infer<typeof htmlBlockSchema>;
export type IEditorBlockDraw = z.infer<typeof drawBlockSchema>;
export type IEditorBlockType = IEditorBlocks["type"];
export type Template = z.infer<typeof templateSchema>;
export type ICanvasState = z.infer<typeof canvasStateSchema>;
