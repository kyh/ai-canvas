import {
  convertToModelMessages,
  createGateway,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";

import type {
  BuildModeChatUIMessage,
  GenerateModeChatUIMessage,
} from "../messages/types";
import type { SelectionBounds } from "@/lib/types";
import { createLoadingBlock } from "../tools/build-html-block";
import { createCanvasAgent, createBuilderAgent, detectAgent } from "@/agents";

export const streamChatResponse = async (
  messages: BuildModeChatUIMessage[] | GenerateModeChatUIMessage[],
  gatewayApiKey: string,
  selectionBounds?: SelectionBounds
) => {
  const model = createGateway({
    apiKey:
      gatewayApiKey === process.env.SECRET_KEY
        ? process.env.AI_GATEWAY_API_KEY
        : gatewayApiKey,
  })("openai/gpt-5.1-instant");

  // Detect which agent should handle this request
  const agentType = await detectAgent(messages, model);

  return createUIMessageStreamResponse({
    stream: createUIMessageStream<BuildModeChatUIMessage>({
      originalMessages: messages,
      execute: async ({ writer }) => {
        switch (agentType) {
          case "builder": {
            // Create loading block immediately for builder agent
            const loadingBlock = createLoadingBlock(selectionBounds);
            const blockId = loadingBlock.id;

            writer.write({
              id: "loading-block",
              type: "data-build-html-block",
              data: { block: loadingBlock },
            });

            // Create and stream the builder agent
            const agent = createBuilderAgent({
              model,
              selectionBounds,
              writer,
              blockId,
            });
            const result = await agent.stream({
              prompt: await convertToModelMessages(
                messages as BuildModeChatUIMessage[]
              ),
            });

            void result.consumeStream();
            writer.merge(
              result.toUIMessageStream({
                sendReasoning: true,
              })
            );
            break;
          }
          case "canvas":
          default: {
            // Create and stream the canvas agent
            const agent = createCanvasAgent({ model, gatewayApiKey, writer });
            const result = await agent.stream({
              prompt: await convertToModelMessages(
                messages as GenerateModeChatUIMessage[]
              ),
            });

            void result.consumeStream();
            writer.merge(
              result.toUIMessageStream({
                sendReasoning: true,
              })
            );
            break;
          }
        }
      },
    }),
  });
};
