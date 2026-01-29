import { ToolLoopAgent, type LanguageModel } from "ai";

import type { CanvasStreamWriter } from "@/ai/messages/types";
import type { SelectionBounds } from "@/lib/types";
import builderPrompt from "./prompts/builder-prompt";

/**
 * Builder Agent - responsible for converting selected nodes to HTML.
 * This agent analyzes canvas designs and generates interactive HTML/CSS/JS code.
 */
type BuilderAgentParams = {
  model: LanguageModel;
  selectionBounds?: SelectionBounds;
  writer: CanvasStreamWriter;
  blockId: string;
};

export const createBuilderAgent = ({
  model,
  selectionBounds,
  writer,
  blockId,
}: BuilderAgentParams) => {
  return new ToolLoopAgent({
    id: "builder-agent",
    model,
    instructions: builderPrompt,
    onFinish: async ({ text }) => {
      // When HTML generation is complete, update the block
      if (text && text.trim()) {
        let html = text.trim();

        // Strip markdown code blocks if present (safeguard)
        // Remove ```html or ``` at the start
        html = html.replace(/^```html?\s*/i, "");
        // Remove ``` at the end
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
  });
};

export type BuilderAgent = ReturnType<typeof createBuilderAgent>;
