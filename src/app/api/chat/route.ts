import { validateUIMessages } from "ai";
import { z } from "zod";

import { dataPartSchemas } from "@/ai/messages/data-parts";
import type { ChatUIMessage } from "@/ai/messages/types";
import { streamChatResponse } from "@/ai/response/stream-chat-response";

const bodySchema = z.object({
  messages: z.array(z.unknown()),
  gatewayApiKey: z.string().optional(),
  selectionBounds: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .optional(),
});

export async function POST(request: Request) {
  const parsedBody = bodySchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return new Response("Invalid request body", { status: 400 });
  }

  const { messages: rawMessages, gatewayApiKey, selectionBounds } = parsedBody.data;

  let messages: ChatUIMessage[];
  try {
    messages = await validateUIMessages<ChatUIMessage>({
      messages: rawMessages,
      dataSchemas: dataPartSchemas,
    });
  } catch {
    return new Response("Invalid messages", { status: 400 });
  }

  const isLocal = process.env.NODE_ENV === "development";
  const isSecretKey = !!process.env.SECRET_KEY && gatewayApiKey === process.env.SECRET_KEY;
  const apiKey = isSecretKey || isLocal ? process.env.AI_GATEWAY_API_KEY : gatewayApiKey;

  if (!apiKey) {
    return new Response("Gateway API key is required", { status: 400 });
  }

  return streamChatResponse(messages, apiKey, selectionBounds);
}
