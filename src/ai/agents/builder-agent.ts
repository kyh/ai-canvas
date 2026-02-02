import { createGateway, stepCountIs, ToolLoopAgent } from "ai";

import type { CanvasStreamWriter } from "@/ai/messages/types";
import {
  LOADING_HTML_BLOCK_HEIGHT,
  LOADING_HTML_BLOCK_WIDTH,
  getCanvasCenterPosition,
} from "@/components/canvas/utils/constants";
import { LOADING_HTML } from "@/components/canvas/utils/loading-html";
import { generateId } from "@/lib/id-generator";
import { htmlBlockSchema } from "@/lib/schema";
import type { SelectionBounds } from "@/lib/types";
import builderPrompt from "./builder-agent-prompt";

/**
 * Creates a loading HTML block with a spinner.
 * Used to show a placeholder while HTML is being generated.
 */
export function createLoadingBlock(selectionBounds?: SelectionBounds) {
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
    label: "HTML",
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
    id: generateId(),
  };

  return htmlBlockSchema.parse(block);
}

type CreateBuilderAgentParams = {
  apiKey: string;
  selectionBounds?: SelectionBounds;
  writer: CanvasStreamWriter;
  blockId: string;
};

export function createBuilderAgent({
  apiKey,
  writer,
  blockId,
}: CreateBuilderAgentParams) {
  const model = createGateway({ apiKey })("openai/gpt-5.1-instant");

  return new ToolLoopAgent({
    model,
    instructions: builderPrompt,
    onFinish: async ({ text }) => {
      if (text && text.trim()) {
        let html = text.trim();

        // Strip markdown code blocks if present (safeguard)
        html = html.replace(/^```html?\s*/i, "");
        html = html.replace(/\s*```$/g, "");
        html = html.trim();

        writer.write({
          id: "update-block",
          type: "data-update-html-block",
          data: {
            updateBlockId: blockId,
            html,
          },
        });
      }
    },
    stopWhen: stepCountIs(1),
  });
}

export type BuilderAgent = ReturnType<typeof createBuilderAgent>;
