import { tool } from "ai";
import {
  templateSchema,
  textBlockSchemaWithoutId,
  frameBlockSchemaWithoutId,
  imageBlockSchemaWithoutId,
} from "@/lib/schema";
import { v4 as uuid } from "uuid";

// Helper function to add ID and validate
const createBlockWithId = (
  block: unknown,
  schema:
    | typeof textBlockSchemaWithoutId
    | typeof frameBlockSchemaWithoutId
    | typeof imageBlockSchemaWithoutId
) => {
  const validatedBlock = schema.parse(block);
  const blockWithId = {
    ...validatedBlock,
    id: uuid(),
  };
  return templateSchema.shape.blocks.element.parse(blockWithId);
};

// Define tools with proper types
export const aiTools = {
  generateTextBlock: tool({
    description:
      "Generate a text block with content, styling, and fonts. Use this for headings, paragraphs, labels, captions, and any text content. Can also be used creatively for decorative text elements.",
    inputSchema: textBlockSchemaWithoutId,
    execute: async (block) => {
      return createBlockWithId(block, textBlockSchemaWithoutId);
    },
  }),
  generateFrameBlock: tool({
    description:
      "Generate a frame block - your primary drawing tool! Use this creatively to draw shapes and objects:\n" +
      "- Circles: Set width equal to height, use radius of 50% (set all corners to width/2)\n" +
      "- Squares/Rectangles: Use width and height as needed\n" +
      "- Rounded shapes: Use radius property for rounded corners\n" +
      "- Decorative elements: Combine multiple frames for complex objects (sun, moon, stars, geometric patterns)\n" +
      "- Colored backgrounds: Use background property with hex colors\n" +
      "- Shadows and borders: Add depth and definition with shadow and border properties\n" +
      "Examples: Draw a sun (circle with yellow background), moon (circle with gray), house (rectangles), tree (vertical rectangle + circles for leaves), buttons (rounded rectangles with colors), etc.",
    inputSchema: frameBlockSchemaWithoutId,
    execute: async (block) => {
      return createBlockWithId(block, frameBlockSchemaWithoutId);
    },
  }),
  generateImageBlock: tool({
    description:
      "Generate an image block. Use placeholder URLs like 'https://via.placeholder.com/400' for now.",
    inputSchema: imageBlockSchemaWithoutId,
    execute: async (block) => {
      // TODO: We can generate an actual image and base64 it into the block
      return createBlockWithId(block, imageBlockSchemaWithoutId);
    },
  }),
  // Oher tools:
  // - viewCanvas - Allows the llm to view the canvas state, convert canvas into an image and pass it to the llm
  // - deleteBlock
  // - moveBlock
} as const;

// Export the type of tools for use in useChat
export type AITools = typeof aiTools;

// Create a custom UIMessage type that includes our tools for proper type inference
import type { UIMessage, UIDataTypes, InferUITools } from "ai";

// Infer the UI tool types from our tools
export type AIUITools = InferUITools<AITools>;

// Create a custom UIMessage type that includes our tools for proper type inference
export type CustomUIMessage = UIMessage<unknown, UIDataTypes, AIUITools>;
