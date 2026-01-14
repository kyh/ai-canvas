import {
  stepCountIs,
  ToolLoopAgent,
  type LanguageModel,
} from "ai";

import type { GenerateModeChatUIMessage } from "../messages/types";
import { generateTools } from "../tools";
import generatePrompt from "../response/stream-chat-response-prompt";

/**
 * Creates an agent for generating design blocks based on user prompts.
 * This agent uses AI to create visual elements like frames, text, and images.
 */
export const createGenerateAgent = (
  model: LanguageModel,
  gatewayApiKey: string,
  writer: Parameters<
    Parameters<typeof import("ai").createUIMessageStream>[0]["execute"]
  >[0]["writer"]
) => {
  return new ToolLoopAgent({
    id: "generate-agent",
    model,
    instructions: generatePrompt,
    tools: generateTools({ writer, gatewayApiKey }),
    toolChoice: "required",
    stopWhen: stepCountIs(5),
  });
};

export type GenerateAgent = ReturnType<typeof createGenerateAgent>;
