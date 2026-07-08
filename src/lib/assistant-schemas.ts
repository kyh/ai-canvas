import { z } from "zod";

// Relative (not `@/`) imports so eve's compiler can bundle this module for
// agent tools — eve does not read tsconfig path aliases.
import {
  blockSchema,
  frameBlockSchemaWithoutId,
  imageBlockSchemaWithoutId,
  textBlockSchemaWithoutId,
} from "./schema";

// ---------------------------------------------------------------------------
// Tool input schemas (what the model provides). Ids are server-generated, so
// every input schema omits `id`; the image tool also fills `url` itself.
// ---------------------------------------------------------------------------

export const generateTextBlockInputSchema = textBlockSchemaWithoutId;

export const generateFrameBlockInputSchema = frameBlockSchemaWithoutId;

/** Image input: the model never sets `url` — DALL-E fills it in `execute`. */
export const generateImageBlockInputSchema = imageBlockSchemaWithoutId.omit({ url: true });

export const buildHtmlBlockInputSchema = z.object({
  html: z
    .string()
    .describe("Complete, self-contained HTML document (doctype, head, body, inline CSS/JS)"),
  label: z
    .string()
    .optional()
    .describe("Short descriptive name for the block (e.g. 'Signup form')"),
  width: z.number().optional().describe("Block width in px (default 400)"),
  height: z.number().optional().describe("Block height in px (default 300)"),
  x: z
    .number()
    .optional()
    .describe(
      "Canvas x position — derive from selectionBounds in the per-turn context when present",
    ),
  y: z
    .number()
    .optional()
    .describe(
      "Canvas y position — derive from selectionBounds in the per-turn context when present",
    ),
});

export const updateHtmlBlockInputSchema = z.object({
  updateBlockId: z
    .string()
    .describe("Id of the existing html block to update (from the per-turn context)"),
  html: z.string().describe("Full replacement HTML document"),
  label: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  visible: z.boolean().optional(),
  opacity: z.number().optional(),
});

// ---------------------------------------------------------------------------
// Tool payload schemas (what `execute` returns and the toolbar bridge parses
// out of `action.result` stream events before mutating the zustand store).
// ---------------------------------------------------------------------------

/** Block-producing tools return the fully-formed block, id included. */
export const generatedBlockPayloadSchema = z.object({ block: blockSchema });

/** `update_html_block` echoes the applied patch back. */
export const updateHtmlBlockPayloadSchema = updateHtmlBlockInputSchema;
