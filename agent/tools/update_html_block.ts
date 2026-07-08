import { defineTool } from "eve/tools";

// Relative imports: agent/ is compiled by eve, which resolves plain relative
// paths but not tsconfig `@/*` aliases.
import {
  updateHtmlBlockInputSchema,
  updateHtmlBlockPayloadSchema,
} from "../../src/lib/assistant-schemas";

export default defineTool({
  description: `Update an existing HTML block on the canvas with new markup. Use this when the user asks to change, fix, or iterate on an HTML block that already exists.

- **updateBlockId**: the exact id of the html block to update, taken from the per-turn context's selected blocks
- **html**: the FULL replacement HTML document (complete <!DOCTYPE html> document, not a diff), raw HTML with no markdown fences
- **label / width / height / visible / opacity**: optional block property updates

Only call this for blocks of type "html" whose id appears in the per-turn context. To create a new HTML block, use build_html_block instead.`,
  inputSchema: updateHtmlBlockInputSchema,
  outputSchema: updateHtmlBlockPayloadSchema,
  // Tools are stateless and cannot see the canvas, so the patch is echoed
  // back; the client validates the id against the store before applying.
  execute: (input) => ({
    ...input,
    html: input.html
      .trim()
      .replace(/^```html?\s*/i, "")
      .replace(/\s*```$/g, "")
      .trim(),
  }),
  toModelOutput: (output) => ({
    type: "text",
    value: `Successfully updated HTML block ${output.updateBlockId}.`,
  }),
});
