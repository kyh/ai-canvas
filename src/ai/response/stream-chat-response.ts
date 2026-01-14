import {
  convertToModelMessages,
  createGateway,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateObject,
} from "ai";

import type {
  BuildModeChatUIMessage,
  GenerateModeChatUIMessage,
} from "../messages/types";
import type { SelectionBounds } from "@/lib/types";
import { createLoadingBlock } from "../tools/build-html-block";
import { createGenerateAgent } from "../agents/generate-agent";
import { createBuildAgent } from "../agents/build-agent";
import { z } from "zod";

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

  const {
    object: { mode },
  } = await generateObject({
    system:
      "Determine what the user is asking for based on the messages. The user is either asking for you to generate a design, or to build a website from a design. By default, assume the user is asking for you to generate a design.",
    messages: await convertToModelMessages(messages),
    model,
    schema: z.object({
      mode: z.enum(["generate", "build"]),
    }),
  });

  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      originalMessages: messages,
      execute: async ({ writer }) => {
        switch (mode) {
          case "build": {
            // Create loading block immediately for build mode
            const loadingBlock = createLoadingBlock(selectionBounds);
            const blockId = loadingBlock.id;

            writer.write({
              id: "loading-block",
              type: "data-build-html-block",
              data: {
                "build-html-block": {
                  block: loadingBlock,
                },
              },
            });

            // Create and stream the build agent
            const agent = createBuildAgent(model, selectionBounds, writer, blockId);
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
          case "generate":
          default: {
            // Create and stream the generate agent
            const agent = createGenerateAgent(model, gatewayApiKey, writer);
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
