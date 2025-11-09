import type { UIMessage, UIMessageStreamWriter } from "ai";
import { tool } from "ai";
import { textBlockSchemaWithoutId } from "@/lib/schema";
import { createBlockWithId } from "./utils";

import type { DataPart } from "../messages/data-parts";
import description from "./generate-text-block.md";

type Params = {
  writer: UIMessageStreamWriter<UIMessage<never, DataPart>>;
};

export const generateTextBlock = ({ writer }: Params) =>
  tool({
    description,
    inputSchema: textBlockSchemaWithoutId,
    execute: async (block, { toolCallId }) => {
      const blockWithId = createBlockWithId(block, textBlockSchemaWithoutId);

      writer.write({
        id: toolCallId,
        type: "data-generate-text-block",
        data: {
          // @ts-expect-error - This is a valid data part
          "generate-text-block": {
            block: blockWithId,
            status: "done",
          },
        },
      });

      return `Successfully generated text block "${block.label}" with ID ${blockWithId.id}.`;
    },
  });
