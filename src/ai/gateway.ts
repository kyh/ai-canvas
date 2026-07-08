import { createGateway } from "ai";

/** Single model id used by every agent (router, canvas, builder). */
const MODEL_ID = "openai/gpt-5.1-instant";

/** Image model id used by the canvas agent's image tool. */
const IMAGE_MODEL_ID = "openai/dall-e-3";

/**
 * Creates the language model for the given Vercel AI Gateway key.
 * The one place model instantiation happens — agents import from here.
 */
export function createModel(apiKey: string) {
  return createGateway({ apiKey })(MODEL_ID);
}

/**
 * Creates the image model for the given Vercel AI Gateway key via the
 * gateway's typed image-model entrypoint.
 */
export function createImageModel(apiKey: string) {
  return createGateway({ apiKey }).imageModel(IMAGE_MODEL_ID);
}
