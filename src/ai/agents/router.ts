import { convertToModelMessages, generateObject, type LanguageModel } from "ai";
import { z } from "zod";

import type {
  BuildModeChatUIMessage,
  GenerateModeChatUIMessage,
} from "@/ai/messages/types";

/**
 * Agent types that can be routed to
 */
export type AgentType = "canvas" | "builder";

/**
 * Router schema for agent detection
 */
const routerSchema = z.object({
  agent: z.enum(["canvas", "builder"]),
});

/**
 * System prompt for agent routing detection
 */
const routerSystemPrompt = `You are a routing assistant that determines which AI agent should handle a user's request.

There are two agents available:

1. **canvas** - The Canvas Agent handles requests to:
   - Create, modify, or delete visual elements on the canvas
   - Draw shapes, add text, insert images
   - Update styling, positioning, or properties of existing elements
   - General design generation and canvas manipulation

2. **builder** - The Builder Agent handles requests to:
   - Convert designs to HTML/CSS/JS code
   - Build interactive web components from canvas elements
   - Export or generate code from the current design
   - Create functional websites from visual designs

Analyze the user's message and determine which agent should handle the request.

Default to "canvas" if the intent is unclear or if the user is asking for general design help.`;

/**
 * Detects which agent should handle the incoming request based on user messages.
 * Routes to either the canvas-agent (for updating canvas nodes) or
 * builder-agent (for converting nodes to HTML).
 */
export const detectAgent = async (
  messages: BuildModeChatUIMessage[] | GenerateModeChatUIMessage[],
  model: LanguageModel
): Promise<AgentType> => {
  const {
    object: { agent },
  } = await generateObject({
    system: routerSystemPrompt,
    messages: await convertToModelMessages(messages),
    model,
    schema: routerSchema,
  });

  return agent;
};

/**
 * Route information returned by the router
 */
export type RouteResult = {
  agent: AgentType;
};
