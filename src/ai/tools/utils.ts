import { generateId } from "@/lib/id-generator";
import { templateSchema } from "@/lib/schema";
import type { z } from "zod";

/**
 * Creates a block with a generated ID and validates it against the template schema.
 * This is a shared utility used by all block generation tools.
 */
export function createBlockWithId<T extends z.ZodTypeAny>(
  block: unknown,
  schema: T
): z.infer<typeof templateSchema.shape.blocks.element> {
  const validatedBlock = schema.parse(block) as Record<string, unknown>;
  const blockWithId = {
    ...validatedBlock,
    id: generateId(),
  };
  return templateSchema.shape.blocks.element.parse(blockWithId);
}
