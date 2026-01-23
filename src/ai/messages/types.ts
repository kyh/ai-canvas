import type { UIMessage, UIMessageStreamWriter } from "ai";

import type { GenerateToolSet } from "../tools";
import type { DataPart } from "./data-parts";
import type { Metadata } from "./metadata";

export type BuildModeChatUIMessage = UIMessage<Metadata, DataPart>;

export type GenerateModeChatUIMessage = UIMessage<
  Metadata,
  DataPart,
  GenerateToolSet
>;

/** Typed writer for streaming data parts to the UI */
export type CanvasStreamWriter = UIMessageStreamWriter<
  UIMessage<Metadata, DataPart>
>;
