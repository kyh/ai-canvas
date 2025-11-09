import type { UIMessage, UIMessageStreamWriter } from "ai";
import { tool } from "ai";
import { frameBlockSchemaWithoutId } from "@/lib/schema";
import { createBlockWithId } from "./utils";

import type { DataPart } from "../messages/data-parts";
import description from "./generate-frame-block.md";

type Params = {
  writer: UIMessageStreamWriter<UIMessage<never, DataPart>>;
};

export const generateFrameBlock = ({ writer }: Params) =>
  tool({
    description,
    inputSchema: frameBlockSchemaWithoutId,
    execute: async (block, { toolCallId }) => {
      const blockWithId = createBlockWithId(block, frameBlockSchemaWithoutId);

      writer.write({
        id: toolCallId,
        type: "data-generate-frame-block",
        data: {
          // @ts-expect-error - This is a valid data part
          "generate-frame-block": {
            block: blockWithId,
            status: "done",
          },
        },
      });

      return `Successfully generated frame block "${block.label}" with ID ${blockWithId.id}.`;
    },
  });
