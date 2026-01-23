import { stepCountIs, ToolLoopAgent, type LanguageModel } from "ai";

import type { CanvasStreamWriter } from "../messages/types";
import { generateTools } from "../tools";
import generatePrompt from "../response/stream-chat-response-prompt";

/**
 * Creates an agent for generating design blocks based on user prompts.
 * This agent uses AI to create visual elements like frames, text, and images.
 */
type Params = {
  model: LanguageModel;
  gatewayApiKey: string;
  writer: CanvasStreamWriter;
};

export const createGenerateAgent = ({ model, gatewayApiKey, writer }: Params) => {
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
