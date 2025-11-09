import type { UIMessage, UIMessageStreamWriter } from "ai";
import { tool } from "ai";
import { z } from "zod";
import { htmlBlockSchemaWithoutId } from "@/lib/schema";
import { LOADING_HTML } from "@/components/canvas/utils/loading-html";
import {
  LOADING_HTML_BLOCK_WIDTH,
  LOADING_HTML_BLOCK_HEIGHT,
  getCanvasCenterPosition,
} from "@/components/canvas/utils/constants";
import type { SelectionBounds } from "@/lib/types";
import { createBlockWithId } from "./utils";

import type { DataPart } from "../messages/data-parts";
import description from "./generate-html-block.md";

type Params = {
  writer: UIMessageStreamWriter<UIMessage<never, DataPart>>;
  selectionBounds?: SelectionBounds;
};

// Helper to create a loading HTML block
const createLoadingBlock = (selectionBounds?: SelectionBounds) => {
  // Calculate position: right of selection or center
  const centerPos = getCanvasCenterPosition(
    LOADING_HTML_BLOCK_WIDTH,
    LOADING_HTML_BLOCK_HEIGHT
  );
  const x = selectionBounds
    ? selectionBounds.x + selectionBounds.width + 30
    : centerPos.x;
  const y = selectionBounds ? selectionBounds.y : centerPos.y;

  const block = {
    type: "html" as const,
    label: "Generating HTML...",
    x,
    y,
    width: LOADING_HTML_BLOCK_WIDTH,
    height: LOADING_HTML_BLOCK_HEIGHT,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    visible: true,
    opacity: 100,
    html: LOADING_HTML,
    background: "#ffffff",
    border: {
      color: "#d1d5db",
      width: 1,
    },
    radius: { tl: 16, tr: 16, br: 16, bl: 16 },
  };

  return createBlockWithId(block, htmlBlockSchemaWithoutId);
};

export const generateHTML = ({ writer, selectionBounds }: Params) =>
  tool({
    description,
    inputSchema: z.object({}).strict(), // No input - AI analyzes image automatically
    execute: async (_, { toolCallId }) => {
      // Create a loading HTML block immediately
      const loadingBlock = createLoadingBlock(selectionBounds);

      writer.write({
        id: toolCallId,
        type: "data-add-html-to-canvas",
        data: {
          // @ts-expect-error - This is a valid data part
          "add-html-to-canvas": {
            block: loadingBlock,
            status: "loading" as const,
          },
        },
      });

      return `Created loading placeholder for HTML block. Analyzing image and generating HTML/CSS/JS code. Use the addHTMLToCanvas tool with block ID ${loadingBlock.id} to update it with the generated HTML.`;
    },
  });
