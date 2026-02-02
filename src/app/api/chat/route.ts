import { streamChatResponse } from "@/ai/response/stream-chat-response";

import type {
  GenerateModeChatUIMessage,
  BuildModeChatUIMessage,
} from "@/ai/messages/types";
import type { SelectionBounds } from "@/lib/types";

type BodyData = {
  messages: GenerateModeChatUIMessage[] | BuildModeChatUIMessage[];
  gatewayApiKey?: string;
  selectionBounds?: SelectionBounds;
};

export async function POST(request: Request) {
  const bodyData = (await request.json()) as BodyData;
  const { messages, gatewayApiKey, selectionBounds } = bodyData;

  const isLocal = process.env.NODE_ENV === "development";
  const isSecretKey = gatewayApiKey === process.env.SECRET_KEY;
  const apiKey =
    isSecretKey || isLocal ? process.env.AI_GATEWAY_API_KEY : gatewayApiKey;

  if (!apiKey) {
    return new Response("Gateway API key is required", { status: 400 });
  }

  return streamChatResponse(messages, apiKey, selectionBounds);
}
