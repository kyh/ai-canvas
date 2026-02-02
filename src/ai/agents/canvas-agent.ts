import type { ImageModel } from "ai";
import {
  createGateway,
  experimental_generateImage as generateImage,
  stepCountIs,
  tool,
  ToolLoopAgent,
} from "ai";

import type { CanvasStreamWriter } from "@/ai/messages/types";
import { generateId } from "@/lib/id-generator";
import {
  frameBlockSchemaWithoutId,
  imageBlockSchemaWithoutId,
  templateSchema,
  textBlockSchemaWithoutId,
} from "@/lib/schema";
import type { z } from "zod";
import canvasPrompt from "./canvas-agent-prompt";

type WriterParams = { writer: CanvasStreamWriter };

function createBlockWithId<T extends z.ZodTypeAny>(
  block: unknown,
  schema: T
): z.infer<typeof templateSchema.shape.blocks.element> {
  const validatedBlock = schema.parse(block) as Record<string, unknown>;
  const blockWithId = {
    ...validatedBlock,
    id: generateId(),
  };
  return templateSchema.shape.blocks.element.parse(blockWithId);
}

const generateTextBlockDescription = `Use this tool to generate a text block on the canvas. Text blocks are versatile elements that can be used for headings, paragraphs, labels, captions, body text, and even decorative text elements.

## When to Use This Tool

Use Generate Text Block when:

1. The user requests text content on the canvas (headings, paragraphs, labels, etc.)
2. You need to add typography or text-based design elements
3. You want to create decorative text elements or text-based graphics
4. The user asks for labels, captions, or annotations to accompany other elements

## Text Block Properties

- **label**: Descriptive name for the block (e.g., "Heading", "Body Text", "Label")
- **text**: The actual text content to display
- **x, y**: Position on the canvas (default canvas is 1280x720, center is ~640, 360)
- **width, height**: Dimensions of the text block
- **color**: Text color as hex (e.g., "#000000" for black, "#FFFFFF" for white)
- **fontSize**: Font size in pixels
- **lineHeight**: Line height multiplier or pixels
- **letterSpacing**: Letter spacing in pixels
- **textAlign**: Alignment ("center", "left", "right", "justify")
- **font**: Font family and weight
- **textTransform**: Optional text transformation ("inherit", "capitalize", "uppercase", "lowercase")
- **textDecoration**: Optional decoration ("inherit", "overline", "line-through", "underline")
- **opacity**: 0-100 (100 = fully opaque)
- **visible**: true (default)
- **rotation**: Optional rotation in degrees
- **background**: Optional background color for the text block
- **shadow**: Optional shadow for depth
- **border**: Optional border around the text block

## Best Practices

- Use appropriate font sizes for readability (typically 12-72px for most use cases)
- Set appropriate line height for readability (1.2-1.6x font size is common)
- Choose high contrast colors for text readability
- Position text blocks thoughtfully relative to other canvas elements
- Use textAlign to control text positioning within the block
- Consider using background colors or borders to make text stand out`;

function createGenerateTextBlockTool({ writer }: WriterParams) {
  return tool({
    description: generateTextBlockDescription,
    inputSchema: textBlockSchemaWithoutId,
    execute: async (block, { toolCallId }) => {
      const blockWithId = createBlockWithId(block, textBlockSchemaWithoutId);

      writer.write({
        id: toolCallId,
        type: "data-generate-text-block",
        data: {
          block: blockWithId,
          status: "done",
        },
      });

      return `Successfully generated text block "${block.label}" with ID ${blockWithId.id}.`;
    },
  });
}

const generateFrameBlockDescription = `Use this tool to generate a frame block on the canvas. Frame blocks are your primary drawing tool! They can be used creatively to draw shapes, objects, and decorative elements by leveraging their styling properties.

## When to Use This Tool

Use Generate Frame Block when:

1. You need to draw geometric shapes (circles, squares, rectangles)
2. You want to create decorative elements (rounded cards, badges, buttons)
3. You need background elements (colored areas, patterns)
4. You want to create complex objects by combining multiple frames (e.g., faces, animals, objects)

## Creative Drawing Techniques

### Circles
- Set width and height equal
- Use radius of 50% (set all corners to width/2 or height/2)
- Example: width: 100, height: 100, radius: { tl: 50, tr: 50, br: 50, bl: 50 }

### Squares/Rectangles
- Use width and height as needed for the desired shape
- Use radius property for rounded corners (0-50% of the smallest dimension)

### Rounded Shapes
- Use the radius property to round corners
- Set individual corner values (tl, tr, br, bl) for asymmetric rounding

### Complex Objects
- Break complex objects into simple shapes
- Combine multiple frame blocks with different sizes, positions, and colors
- Use rotation for angled elements
- Use opacity for layering effects

## Frame Block Properties

- **label**: Descriptive name (e.g., "Sun", "Background Card", "Button")
- **x, y**: Position on 1280x720 canvas (center is ~640, 360)
- **width, height**: Dimensions (use equal width/height for circles)
- **visible**: true (default)
- **opacity**: 0-100 (100 = fully opaque, lower for transparency effects)
- **background**: Hex color (e.g., "#FFD700" for yellow, "#FF0000" for red)
- **radius**: Object with tl/tr/br/bl values in pixels. For circles, set all corners to width/2
- **border**: Optional border with width, color, and dash array
- **shadow**: Optional shadow for depth (color, offsetX, offsetY, blur, enabled)
- **rotation**: Optional rotation in degrees
- **scaleX, scaleY**: Optional scaling factors (default 1)

## Important Notes

- For circles: width === height, and radius should be 50% (set all corners to width/2)
- Position blocks thoughtfully, leaving space for other elements
- Use vibrant, appropriate colors for the objects you're drawing
- Do not include "id" field - it's auto-generated
- Think creatively - break complex objects into simple shapes`;

function createGenerateFrameBlockTool({ writer }: WriterParams) {
  return tool({
    description: generateFrameBlockDescription,
    inputSchema: frameBlockSchemaWithoutId,
    execute: async (block, { toolCallId }) => {
      const blockWithId = createBlockWithId(block, frameBlockSchemaWithoutId);

      writer.write({
        id: toolCallId,
        type: "data-generate-frame-block",
        data: {
          block: blockWithId,
          status: "done",
        },
      });

      return `Successfully generated frame block "${block.label}" with ID ${blockWithId.id}.`;
    },
  });
}

const generateImageBlockDescription = `Use this tool to generate an image block on the canvas. Image blocks always use AI-generated images via DALL-E 3 and can be styled with various properties for positioning and sizing.

## When to Use This Tool

Use Generate Image Block when:

1. The user requests an image to be displayed on the canvas
2. The user asks for images, illustrations, or graphics
3. You need to add visual elements like photos, illustrations, or graphics
4. The user provides a description of an image they want generated

## Image Block Properties

- **label**: Descriptive name for the block (e.g., "Logo", "Photo", "Illustration")
- **prompt**: Text description for AI image generation (e.g., "a modern logo with blue gradient", "a sunset over mountains"). If not provided, the **label** will be used as the prompt. Always provide detailed, descriptive prompts for best results.
- **url**: This field is automatically generated from the AI image and should not be set manually
- **x, y**: Position on the canvas
- **width, height**: Dimensions of the image block
- **fit**: How the image fits within the block ("contain", "cover", "fill", "fitWidth", "fitHeight")
- **position**: Image position within the block ("center", "top", "bottom", "left", "right")
- **opacity**: 0-100 (100 = fully opaque)
- **visible**: true (default)
- **rotation**: Optional rotation in degrees
- **shadow**: Optional shadow for depth
- **border**: Optional border around the image
- **radius**: Optional rounded corners

## Best Practices

- **AI Image Generation**: This tool ALWAYS generates images using DALL-E 3. Provide detailed, descriptive prompts for best results.
- **Prompt Quality**: The more descriptive and specific your prompt, the better the generated image will match the intended design.
- **Image Dimensions**: Use appropriate image dimensions for the canvas size (1280x720 default). AI-generated images are 1024x1024.
- **Fit Mode**: Choose appropriate fit mode based on desired effect:
  - "contain": Image fits within block, maintains aspect ratio
  - "cover": Image fills block, may be cropped, maintains aspect ratio
  - "fill": Image stretches to fill block, may distort`;

function createGenerateImageBlockTool({
  writer,
  apiKey,
}: WriterParams & { apiKey: string }) {
  return tool({
    description: generateImageBlockDescription,
    inputSchema: imageBlockSchemaWithoutId,
    execute: async (block, { toolCallId }) => {
      const imagePrompt = block.prompt || block.label;

      let imageUrl: string;

      try {
        const model = createGateway({ apiKey })(
          "openai/dall-e-3"
        ) as unknown as ImageModel;

        const { images } = await generateImage({
          model,
          prompt: imagePrompt,
          n: 1,
          size: "1024x1024",
        });

        if (!images || images.length === 0) {
          throw new Error("No images were generated");
        }

        const generatedImage = images[0];
        imageUrl = `data:${generatedImage.mediaType};base64,${generatedImage.base64}`;
      } catch (error) {
        console.error(
          `[CanvasAgent] Failed to generate image for "${block.label}":`,
          error
        );
        throw new Error(
          `Failed to generate image: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }

      const blockWithId = createBlockWithId(
        { ...block, url: imageUrl, prompt: imagePrompt },
        imageBlockSchemaWithoutId
      );

      writer.write({
        id: toolCallId,
        type: "data-generate-image-block",
        data: {
          block: blockWithId,
          status: "done",
        },
      });

      return `Successfully generated image block "${block.label}" with ID ${blockWithId.id} using AI image generation.`;
    },
  });
}

type CreateCanvasAgentParams = {
  apiKey: string;
  writer: CanvasStreamWriter;
};

export function createCanvasAgent({ apiKey, writer }: CreateCanvasAgentParams) {
  const model = createGateway({ apiKey })("openai/gpt-5.1-instant");

  return new ToolLoopAgent({
    model,
    instructions: canvasPrompt,
    tools: {
      generateTextBlock: createGenerateTextBlockTool({ writer }),
      generateFrameBlock: createGenerateFrameBlockTool({ writer }),
      generateImageBlock: createGenerateImageBlockTool({ writer, apiKey }),
    },
    toolChoice: "required",
    stopWhen: stepCountIs(5),
  });
}

export type CanvasAgent = ReturnType<typeof createCanvasAgent>;
