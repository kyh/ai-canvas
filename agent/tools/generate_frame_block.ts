import { defineTool } from "eve/tools";

// Relative imports: agent/ is compiled by eve, which resolves plain relative
// paths but not tsconfig `@/*` aliases. Domain schemas stay in src/lib.
import {
  generatedBlockPayloadSchema,
  generateFrameBlockInputSchema,
} from "../../src/lib/assistant-schemas";
import { generateId } from "../../src/lib/id-generator";
import { blockSchema } from "../../src/lib/schema";

export default defineTool({
  description: `Generate a frame block on the canvas. Frame blocks are your primary drawing tool — use them creatively to draw shapes, objects, and decorative elements via their styling properties.

## When to use

1. Geometric shapes (circles, squares, rectangles)
2. Decorative elements (rounded cards, badges, buttons)
3. Background elements (colored areas, patterns)
4. Complex objects composed of multiple frames (faces, animals, houses, trees)

## Drawing techniques

- **Circles**: width === height, radius 50% (set all corners tl/tr/br/bl to width/2)
- **Squares/Rectangles**: width and height as needed; use radius for rounded corners
- **Complex objects**: break into simple shapes, combine multiple frames with different sizes, positions, colors, rotation, and opacity

## Properties

- **label**: Descriptive name (e.g. "Sun", "Background Card", "Button")
- **x, y**: Position on 1280x720 canvas (center is ~640, 360)
- **width, height**: Dimensions (equal for circles)
- **visible**: true (default); **opacity**: 0-100
- **background**: Hex color (e.g. "#FFD700")
- **radius**: Object with tl/tr/br/bl pixel values; for circles set all to width/2
- **border**: Optional (width, color, dash array)
- **shadow**: Optional (color, offsetX, offsetY, blur, enabled)
- **rotation**: Optional degrees; **scaleX/scaleY**: Optional (default 1)

## Notes

- Position blocks thoughtfully, leaving space for other elements
- Use vibrant, appropriate colors for the objects you draw
- Do not include an "id" field — it is generated for you`,
  execute: (input) => ({
    block: blockSchema.parse({ ...input, id: generateId() }),
  }),
  inputSchema: generateFrameBlockInputSchema,
  outputSchema: generatedBlockPayloadSchema,
  toModelOutput: (output) => ({
    type: "text",
    value: `Successfully generated frame block "${output.block.label}" with ID ${output.block.id}.`,
  }),
});
