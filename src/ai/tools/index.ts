import type { InferUITools, UIMessage, UIMessageStreamWriter } from "ai";

import type { DataPart } from "../messages/data-parts";
import { generateFrameBlock } from "./generate-frame-block";
import { generateImageBlock } from "./generate-image-block";
import { generateTextBlock } from "./generate-text-block";

type WriterParams = {
  writer: UIMessageStreamWriter<UIMessage<never, DataPart>>;
};

export function generateTools({ writer }: WriterParams) {
  return {
    generateTextBlock: generateTextBlock({ writer }),
    generateFrameBlock: generateFrameBlock({ writer }),
    generateImageBlock: generateImageBlock({ writer }),
  };
}

// buildTools is no longer needed - HTML blocks are created/updated manually in stream-chat-response.ts
export function buildTools() {
  return {};
}

export type GenerateToolSet = InferUITools<ReturnType<typeof generateTools>>;
export type BuildToolSet = InferUITools<ReturnType<typeof buildTools>>;
