import {
  ToolLoopAgent,
  type LanguageModel,
} from "ai";

import type { BuildModeChatUIMessage } from "../messages/types";
import type { SelectionBounds } from "@/lib/types";
import buildPrompt from "../response/stream-chat-response-build-prompt";

/**
 * Creates an agent for building HTML from design blocks.
 * This agent converts visual designs into HTML code.
 */
export const createBuildAgent = (
  model: LanguageModel,
  selectionBounds: SelectionBounds | undefined,
  writer: Parameters<
    Parameters<typeof import("ai").createUIMessageStream>[0]["execute"]
  >[0]["writer"],
  blockId: string
) => {
  return new ToolLoopAgent({
    id: "build-agent",
    model,
    instructions: buildPrompt,
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
            "update-html-block": {
              updateBlockId: blockId,
              html,
            },
          },
        });
      }
    },
  });
};

export type BuildAgent = ReturnType<typeof createBuildAgent>;
