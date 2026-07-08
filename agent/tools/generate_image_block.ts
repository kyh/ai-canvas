import { createGateway, generateImage } from "ai";
import { defineTool } from "eve/tools";

// Relative imports: agent/ is compiled by eve, which resolves plain relative
// paths but not tsconfig `@/*` aliases. Domain schemas stay in src/lib.
import {
  generatedBlockPayloadSchema,
  generateImageBlockInputSchema,
} from "../../src/lib/assistant-schemas";
import { generateId } from "../../src/lib/id-generator";
import { blockSchema } from "../../src/lib/schema";

/** Image model id used for canvas image generation, via the AI Gateway. */
const IMAGE_MODEL_ID = "openai/gpt-image-1";

export default defineTool({
  description: `Generate an image block on the canvas. The image is ALWAYS AI-generated (gpt-image-1) from your prompt and placed on the canvas.

## When to use

1. The user requests an image, illustration, photo, or graphic on the canvas
2. You need a visual element that primitive text/frame blocks cannot express

## Properties

- **label**: Descriptive name (e.g. "Logo", "Sunset photo")
- **prompt**: Detailed text description for image generation (e.g. "a watercolor sunset over mountains"). If omitted, the label is used. Detailed, specific prompts give the best results.
- **x, y / width, height**: Placement on the canvas (generated images are 1024x1024 — size the block appropriately for the 1280x720 default canvas)
- **fit**: "contain" | "cover" | "fill" | "fitWidth" | "fitHeight"
- **position**: "center" | "top" | "bottom" | "left" | "right"
- **opacity / visible / rotation / shadow / border / radius**: Optional styling

Do not include "id" or "url" fields — both are generated for you.`,
  inputSchema: generateImageBlockInputSchema,
  outputSchema: generatedBlockPayloadSchema,
  execute: async (input, ctx) => {
    const imagePrompt = input.prompt || input.label;

    // BYO-key: the channel verifier stashes the caller's gateway key in the
    // session auth attributes (same chain the dynamic model resolver in
    // agent/agent.ts uses). Keyless sessions fall back to the server's
    // AI_GATEWAY_API_KEY / OIDC credential via the gateway defaults.
    const auth = ctx.session.auth.current ?? ctx.session.auth.initiator;
    const gatewayApiKey = auth?.attributes["gatewayApiKey"];
    const gateway =
      typeof gatewayApiKey === "string" && gatewayApiKey.length > 0
        ? createGateway({ apiKey: gatewayApiKey })
        : createGateway({});
    const model = gateway.imageModel(IMAGE_MODEL_ID);

    const { images } = await generateImage({
      model,
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      abortSignal: ctx.abortSignal,
    });
    if (images.length === 0) {
      throw new Error("No images were generated");
    }
    const generatedImage = images[0];
    const url = `data:${generatedImage.mediaType};base64,${generatedImage.base64}`;

    return {
      block: blockSchema.parse({ ...input, prompt: imagePrompt, url, id: generateId() }),
    };
  },
  // The full block (with its multi-hundred-KB data: URL) goes to the client
  // via `action.result`; the model only ever sees this short ack.
  toModelOutput: (output) => ({
    type: "text",
    value: `Successfully generated image block "${output.block.label}" with ID ${output.block.id} using AI image generation.`,
  }),
});
