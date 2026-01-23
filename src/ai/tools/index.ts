import type { InferUITools } from "ai";

import type { CanvasStreamWriter } from "../messages/types";
import { generateFrameBlock } from "./generate-frame-block";
import { generateImageBlock } from "./generate-image-block";
import { generateTextBlock } from "./generate-text-block";

type Params = { writer: CanvasStreamWriter; gatewayApiKey?: string };

export function generateTools({ writer, gatewayApiKey }: Params) {
  return {
    generateTextBlock: generateTextBlock({ writer }),
    generateFrameBlock: generateFrameBlock({ writer }),
    generateImageBlock: generateImageBlock({ writer, gatewayApiKey }),
  };
}

export type GenerateToolSet = InferUITools<ReturnType<typeof generateTools>>;
