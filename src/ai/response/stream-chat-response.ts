import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse } from "ai";

import type { ChatUIMessage } from "../messages/types";
import type { SelectionBounds } from "@/lib/types";
import { createBuilderAgent, createLoadingBlock } from "../agents/builder-agent";
import { createCanvasAgent } from "../agents/canvas-agent";
import { detectAgent } from "../agents/router";

export async function streamChatResponse(
  messages: ChatUIMessage[],
  apiKey: string,
  selectionBounds?: SelectionBounds,
) {
  const agentType = await detectAgent(messages, apiKey);

  return createUIMessageStreamResponse({
    stream: createUIMessageStream<ChatUIMessage>({
      originalMessages: messages,
      execute: async ({ writer }) => {
        switch (agentType) {
          case "builder": {
            const loadingBlock = createLoadingBlock(selectionBounds);
            const blockId = loadingBlock.id;

            writer.write({
              id: "loading-block",
              type: "data-build-html-block",
              data: { block: loadingBlock },
            });

            const agent = createBuilderAgent({
              apiKey,
              writer,
              blockId,
            });
            const result = await agent.stream({
              prompt: await convertToModelMessages(messages),
            });

            void result.consumeStream();
            writer.merge(
              result.toUIMessageStream({
                sendReasoning: true,
              }),
            );
            break;
          }
          case "canvas":
          default: {
            const agent = createCanvasAgent({ apiKey, writer });
            const result = await agent.stream({
              prompt: await convertToModelMessages(messages),
            });

            void result.consumeStream();
            writer.merge(
              result.toUIMessageStream({
                sendReasoning: true,
              }),
            );
            break;
          }
        }
      },
    }),
  });
}
