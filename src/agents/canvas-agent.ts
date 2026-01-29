import { stepCountIs, ToolLoopAgent, type LanguageModel } from "ai";

import type { CanvasStreamWriter } from "@/ai/messages/types";
import { generateTools } from "@/ai/tools";
import canvasPrompt from "./prompts/canvas-prompt";

/**
 * Canvas Agent - responsible for updating canvas nodes.
 * This agent creates and modifies visual elements like frames, text, and images on the canvas.
 */
type CanvasAgentParams = {
  model: LanguageModel;
  gatewayApiKey: string;
  writer: CanvasStreamWriter;
};

export const createCanvasAgent = ({
  model,
  gatewayApiKey,
  writer,
}: CanvasAgentParams) => {
  return new ToolLoopAgent({
    id: "canvas-agent",
    model,
    instructions: canvasPrompt,
    tools: generateTools({ writer, gatewayApiKey }),
    toolChoice: "required",
    stopWhen: stepCountIs(5),
  });
};

export type CanvasAgent = ReturnType<typeof createCanvasAgent>;
