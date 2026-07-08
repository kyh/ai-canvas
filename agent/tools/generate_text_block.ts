import { defineTool } from "eve/tools";

// Relative imports: agent/ is compiled by eve, which resolves plain relative
// paths but not tsconfig `@/*` aliases. Domain schemas stay in src/lib.
import {
  generatedBlockPayloadSchema,
  generateTextBlockInputSchema,
} from "../../src/lib/assistant-schemas";
import { generateId } from "../../src/lib/id-generator";
import { blockSchema } from "../../src/lib/schema";

export default defineTool({
  description: `Generate a text block on the canvas. Text blocks are versatile elements for headings, paragraphs, labels, captions, body text, and decorative text.

## When to use

1. The user requests text content on the canvas (headings, paragraphs, labels, etc.)
2. You need typography or text-based design elements
3. You want decorative text elements or text-based graphics
4. The user asks for labels, captions, or annotations to accompany other elements

## Properties

- **label**: Descriptive name for the block (e.g. "Heading", "Body Text")
- **text**: The actual text content to display
- **x, y**: Position on the canvas (default canvas is 1280x720, center is ~640, 360)
- **width, height**: Dimensions of the text block
- **color**: Text color as hex (e.g. "#000000")
- **fontSize**: Font size in pixels (typically 12-72px)
- **lineHeight**: Line height multiplier (1.2-1.6x font size is common)
- **letterSpacing**: Letter spacing in pixels
- **textAlign**: "center" | "left" | "right" | "justify"
- **font**: Font family and weight object { family, weight }
- **textTransform / textDecoration**: Optional text treatments
- **opacity**: 0-100 (100 = fully opaque); **visible**: true (default)
- **rotation / background / shadow / border**: Optional styling

## Best practices

- Choose high-contrast colors and readable sizes
- Position text blocks thoughtfully relative to other canvas elements
- Consider background colors or borders to make text stand out
- Do not include an "id" field — it is generated for you`,
  inputSchema: generateTextBlockInputSchema,
  outputSchema: generatedBlockPayloadSchema,
  execute: (input) => ({
    block: blockSchema.parse({ ...input, id: generateId() }),
  }),
  // The client applies the full block from `action.result`; the model only
  // needs a short ack (with the id so it can reference the block later).
  toModelOutput: (output) => ({
    type: "text",
    value: `Successfully generated text block "${output.block.label}" with ID ${output.block.id}.`,
  }),
});
