import { defineTool } from "eve/tools";

// Relative imports: agent/ is compiled by eve, which resolves plain relative
// paths but not tsconfig `@/*` aliases.
import {
  getCanvasCenterPosition,
  LOADING_HTML_BLOCK_HEIGHT,
  LOADING_HTML_BLOCK_WIDTH,
} from "../../src/components/canvas/utils/constants";
import {
  buildHtmlBlockInputSchema,
  generatedBlockPayloadSchema,
} from "../../src/lib/assistant-schemas";
import { generateId } from "../../src/lib/id-generator";
import { blockSchema } from "../../src/lib/schema";

export default defineTool({
  description: `Create a new interactive HTML block on the canvas from a complete HTML document you write. Use this to convert designs into working code, or to build anything that needs real interactivity (forms, games, animations, widgets).

## When to use

1. The user asks to build, code, or make something interactive/functional
2. The user asks to convert the current design (or selection) to HTML/CSS/JS
3. The request needs behavior primitive blocks cannot express (inputs, physics, animation loops)

## HTML requirements

- **Complete document**: include <!DOCTYPE html>, <html>, <head>, <body>; embed all CSS in a <style> tag and all JS in a <script> tag
- **Raw HTML only**: never wrap the document in markdown code fences
- **Iframe rendering**: the block renders inside an iframe — use 100% width/height for full coverage
- **Match the design**: when converting a selection, replicate colors, fonts, spacing, and layout exactly from the attached canvas image
- **Fully interactive**: wire up click handlers, input validation, hover states, transitions
- **External libraries**: you may load npm packages from https://unpkg.com/ via <script src="https://unpkg.com/package@version/dist/file.js"> when they add real value (e.g. Matter.js, Three.js, D3)

## Placement

- If \`selectionBounds\` is present in the per-turn context, set x = selectionBounds.x + selectionBounds.width + 30 and y = selectionBounds.y (place the build next to its source)
- Otherwise omit x/y to center the block on the canvas
- Default size is 400x300 — pass width/height when the content needs more room`,
  inputSchema: buildHtmlBlockInputSchema,
  outputSchema: generatedBlockPayloadSchema,
  execute: (input) => {
    const width = input.width ?? LOADING_HTML_BLOCK_WIDTH;
    const height = input.height ?? LOADING_HTML_BLOCK_HEIGHT;
    const centerPosition = getCanvasCenterPosition(width, height);

    // Safeguard: strip markdown fences if the model wrapped the document.
    const html = input.html
      .trim()
      .replace(/^```html?\s*/i, "")
      .replace(/\s*```$/g, "")
      .trim();

    return {
      block: blockSchema.parse({
        type: "html",
        id: generateId(),
        label: input.label ?? "HTML",
        html,
        x: input.x ?? centerPosition.x,
        y: input.y ?? centerPosition.y,
        width,
        height,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        opacity: 100,
        background: "#ffffff",
        border: { color: "#d1d5db", width: 1 },
        radius: { tl: 16, tr: 16, br: 16, bl: 16 },
      }),
    };
  },
  // The client swaps its loading placeholder for the full block from
  // `action.result`; the model only needs a short ack with the id.
  toModelOutput: (output) => ({
    type: "text",
    value: `Successfully built HTML block "${output.block.label}" with ID ${output.block.id}.`,
  }),
});
