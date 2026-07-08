import type { UIMessage, UIMessageStreamWriter } from "ai";

import type { DataPart } from "./data-parts";

/** The app's UIMessage specialization: typed data parts, no message metadata. */
export type ChatUIMessage = UIMessage<unknown, DataPart>;

/** Typed writer for streaming data parts to the UI */
export type CanvasStreamWriter = UIMessageStreamWriter<ChatUIMessage>;
