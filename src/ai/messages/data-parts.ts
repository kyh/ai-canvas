import z from "zod";
import { blockSchema } from "@/lib/schema";

const generatedBlockSchema = z.object({
  block: blockSchema,
  status: z.literal("done"),
});

/**
 * Zod schemas for every data part streamed from server to client.
 * The wire type carries a "data-" prefix (e.g. "data-generate-text-block");
 * these map keys do not. The client's `onData` parses each payload with the
 * matching schema before mutating the store — no casts.
 */
export const dataPartSchemas = {
  "generate-text-block": generatedBlockSchema,
  "generate-frame-block": generatedBlockSchema,
  "generate-image-block": generatedBlockSchema,
  "build-html-block": z.object({
    block: blockSchema,
  }),
  "update-html-block": z.object({
    /** ID of existing loading block to update */
    updateBlockId: z.string(),
    /** The HTML content to update */
    html: z.string(),
    label: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    visible: z.boolean().optional(),
    opacity: z.number().optional(),
  }),
};

/** Client<->server data-part contract, derived from the schemas above. */
export type DataPart = {
  [K in keyof typeof dataPartSchemas]: z.infer<(typeof dataPartSchemas)[K]>;
};
