import type { InferUITools, UIMessage, UIMessageStreamWriter } from "ai";

import type { DataPart } from "../messages/data-parts";
import type { SelectionBounds } from "@/lib/types";
import { generateFrameBlock } from "./generate-frame-block";
import { generateImageBlock } from "./generate-image-block";
import { generateTextBlock } from "./generate-text-block";
import { generateHTML } from "./generate-html-block";
import { addHTMLToCanvas } from "./add-html-to-canvas";

type WriterParams = {
  writer: UIMessageStreamWriter<UIMessage<never, DataPart>>;
};

type BuildParams = WriterParams & {
  selectionBounds?: SelectionBounds;
};

export function generateTools({ writer }: WriterParams) {
  return {
    generateTextBlock: generateTextBlock({ writer }),
    generateFrameBlock: generateFrameBlock({ writer }),
    generateImageBlock: generateImageBlock({ writer }),
  };
}

export function buildTools({ writer, selectionBounds }: BuildParams) {
  // Track which block IDs have been updated to prevent duplicates
  const updatedBlockIds = new Set<string>();

  return {
    generateHTML: generateHTML({ writer, selectionBounds }),
    addHTMLToCanvas: addHTMLToCanvas({ writer, updatedBlockIds }),
  };
}

export type GenerateToolSet = InferUITools<ReturnType<typeof generateTools>>;
export type BuildToolSet = InferUITools<ReturnType<typeof buildTools>>;
