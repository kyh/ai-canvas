import type { UIMessage, UIMessageStreamWriter } from "ai";
import { tool } from "ai";
import { imageBlockSchemaWithoutId } from "@/lib/schema";
import { createBlockWithId } from "./utils";

import type { DataPart } from "../messages/data-parts";
import description from "./generate-image-block.md";

type Params = {
  writer: UIMessageStreamWriter<UIMessage<never, DataPart>>;
};

export const generateImageBlock = ({ writer }: Params) =>
  tool({
    description,
    inputSchema: imageBlockSchemaWithoutId,
    execute: async (block, { toolCallId }) => {
      const blockWithId = createBlockWithId(block, imageBlockSchemaWithoutId);

      writer.write({
        id: toolCallId,
        type: "data-generate-image-block",
        data: {
          // @ts-expect-error - This is a valid data part
          "generate-image-block": {
            block: blockWithId,
            status: "done",
          },
        },
      });

      return `Successfully generated image block "${block.label}" with ID ${blockWithId.id}.`;
    },
  });
