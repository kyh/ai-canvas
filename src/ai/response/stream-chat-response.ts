import {
  convertToModelMessages,
  createGateway,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateObject,
  stepCountIs,
  ToolLoopAgent,
  LanguageModel,
} from "ai";

import type {
  BuildModeChatUIMessage,
  GenerateModeChatUIMessage,
} from "../messages/types";
import type { DataPart } from "../messages/data-parts";
import type { SelectionBounds } from "@/lib/types";
import { generateTools } from "../tools";
import { createLoadingBlock } from "../tools/build-html-block";
import generatePrompt from "./stream-chat-response-prompt";
import buildPrompt from "./stream-chat-response-build-prompt";
import { z } from "zod";

const createGenerateAgent = (
  model: LanguageModel,
  gatewayApiKey: string,
  writer: any // UIMessageStreamWriter type will be inferred
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

const createBuildAgent = (
  model: LanguageModel,
  selectionBounds: SelectionBounds | undefined,
  writer: any, // UIMessageStreamWriter type will be inferred
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
                // @ts-expect-error - This is a valid data part
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
