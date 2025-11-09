import type { UIMessage, UIMessageStreamWriter } from "ai";
import { tool } from "ai";
import { z } from "zod";
import { htmlBlockSchemaWithoutId } from "@/lib/schema";
import { createBlockWithId } from "./utils";

import type { DataPart } from "../messages/data-parts";
import description from "./add-html-to-canvas.md";

type Params = {
  writer: UIMessageStreamWriter<UIMessage<never, DataPart>>;
  // Track updated block IDs to prevent duplicate updates
  updatedBlockIds?: Set<string>;
};

export const addHTMLToCanvas = ({ writer, updatedBlockIds }: Params) =>
  tool({
    description,
    inputSchema: htmlBlockSchemaWithoutId.extend({
      updateBlockId: z
        .string()
        .describe(
          "ID of existing loading block to update. This is required and should come from the generateHTML tool response."
        ),
    }),
    execute: async (block, { toolCallId }) => {
      const blockInput = block as z.infer<typeof htmlBlockSchemaWithoutId> & {
        updateBlockId: string;
      };
      const updateBlockId = blockInput.updateBlockId;

      // Server-side guard: prevent duplicate updates
      if (updatedBlockIds?.has(updateBlockId)) {
        return `HTML block "${block.label}" (ID: ${updateBlockId}) has already been updated. Skipping duplicate update.`;
      }

      // Create block with the existing ID from the loading block
      const blockWithId = {
        ...createBlockWithId(block, htmlBlockSchemaWithoutId),
        id: updateBlockId,
      };

      // Track that this block has been updated
      if (updatedBlockIds) {
        updatedBlockIds.add(updateBlockId);
      }

      writer.write({
        id: toolCallId,
        type: "data-add-html-to-canvas",
        data: {
          // @ts-expect-error - This is a valid data part
          "add-html-to-canvas": {
            block: blockWithId,
            status: "done" as const,
            updateBlockId,
          },
        },
      });

      return `Successfully updated HTML block "${block.label}" (ID: ${updateBlockId}) with generated HTML.`;
    },
  });
