import { StaticChatTransport } from "@loremllm/transport";
import type { z } from "zod";

import type { ChatUIMessage } from "@/ai/messages/types";
import type { frameBlockSchema, textBlockSchema } from "@/lib/schema";

/**
 * Scripted demo exchange for keyless "demo" mode: a single "forest poster"
 * turn exercising the generateFrameBlock/generateTextBlock tools.
 * Wired into useChat when the stored gateway key is "demo".
 *
 * Each scripted block is emitted as the same parts a real agent turn
 * produces: step-start, tool input-available, tool output-available, then
 * the matching data part the client zod-parses into the canvas store.
 * Ids are stable so replays upsert idempotently.
 */

type FrameBlock = z.infer<typeof frameBlockSchema>;
type TextBlock = z.infer<typeof textBlockSchema>;
type ChatPart = ChatUIMessage["parts"][number];

type ScriptedBlock = {
  toolName: "generateFrameBlock" | "generateTextBlock";
  callId: string;
  block: FrameBlock | TextBlock;
  dataPart: ChatPart;
};

const blockBase = {
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  visible: true,
  opacity: 100,
};

/** Frame block entry; `circleRadius` rounds all four corners (circles = size/2). */
function frame(
  callId: string,
  id: string,
  label: string,
  x: number,
  y: number,
  width: number,
  height: number,
  background: string,
  circleRadius?: number,
): ScriptedBlock {
  const block: FrameBlock = {
    ...blockBase,
    id,
    type: "frame",
    label,
    x,
    y,
    width,
    height,
    background,
    ...(circleRadius === undefined
      ? {}
      : { radius: { tl: circleRadius, tr: circleRadius, br: circleRadius, bl: circleRadius } }),
  };
  return {
    toolName: "generateFrameBlock",
    callId,
    block,
    dataPart: {
      type: "data-generate-frame-block",
      id: callId,
      data: { block, status: "done" },
    },
  };
}

/** Centered Arial text block entry (x 640, width 800, forest green). */
function text(
  callId: string,
  id: string,
  label: string,
  y: number,
  height: number,
  content: string,
  fontSize: number,
  letterSpacing: number,
  weight: string,
): ScriptedBlock {
  const block: TextBlock = {
    ...blockBase,
    id,
    type: "text",
    label,
    x: 640,
    y,
    width: 800,
    height,
    text: content,
    color: "#228B22",
    fontSize,
    lineHeight: 1.2,
    letterSpacing,
    textAlign: "center",
    font: { family: "Arial", weight },
  };
  return {
    toolName: "generateTextBlock",
    callId,
    block,
    dataPart: {
      type: "data-generate-text-block",
      id: callId,
      data: { block, status: "done" },
    },
  };
}

const SKY = "#87CEEB";
const TRUNK = "#8B4513";
const LEAVES = "#228B22";
const GRASS = "#90EE90";

const scriptedBlocks: ScriptedBlock[] = [
  frame(
    "call_95017036",
    "97a14f2f-52c4-4085-a111-d61712ebcfda",
    "Background Sky",
    0,
    0,
    1280,
    720,
    SKY,
  ),
  frame(
    "call_25310002",
    "e6008550-a709-486e-a691-9d2f3c39b730",
    "Tree1 Trunk",
    300,
    400,
    30,
    200,
    TRUNK,
  ),
  frame(
    "call_59834983",
    "ec3e9707-e9b1-4cb2-a16f-848bed3fd078",
    "Tree1 Leaves",
    240,
    260,
    150,
    150,
    LEAVES,
    75,
  ),
  frame(
    "call_92343095",
    "1630b292-8fc1-4067-9c78-09589ed01a3d",
    "Tree2 Trunk",
    500,
    350,
    40,
    250,
    TRUNK,
  ),
  frame(
    "call_82410342",
    "98e0db01-a16d-4a40-8ed6-abc085962b64",
    "Tree2 Leaves",
    440,
    160,
    200,
    200,
    LEAVES,
    100,
  ),
  frame(
    "call_96486827",
    "2443c4b5-a22d-476e-8da6-1f3143170b84",
    "Tree3 Trunk",
    700,
    450,
    25,
    180,
    TRUNK,
  ),
  frame(
    "call_91569788",
    "bdb21e06-2935-4df8-aa73-952e960c1f95",
    "Tree3 Leaves",
    640,
    310,
    120,
    120,
    LEAVES,
    60,
  ),
  text(
    "call_32334326",
    "e5940f94-d27d-405a-82c0-0ab2b2a42d72",
    "Poster Title",
    100,
    80,
    "Forest Poster",
    48,
    1,
    "bold",
  ),
  frame(
    "call_35743726",
    "78d07737-78f3-4b2a-976c-4531c40dad0e",
    "Tree4 Trunk",
    150,
    420,
    35,
    220,
    TRUNK,
  ),
  frame(
    "call_82522411",
    "c24cc0c2-17e9-42ac-80de-f3811469e470",
    "Tree4 Leaves",
    90,
    230,
    180,
    180,
    LEAVES,
    90,
  ),
  frame(
    "call_82885072",
    "01b0fc5f-0204-44d5-9fc9-89c47c4d5a6d",
    "Tree5 Trunk",
    900,
    380,
    30,
    210,
    TRUNK,
  ),
  frame(
    "call_78500785",
    "dcdf8b83-a796-48f4-a9ff-cc4c2afcb96d",
    "Tree5 Leaves",
    840,
    210,
    160,
    160,
    LEAVES,
    80,
  ),
  frame(
    "call_67677292",
    "521ce3cb-d8db-4098-99c2-1a79cb053808",
    "Ground",
    0,
    600,
    1280,
    120,
    GRASS,
  ),
  frame(
    "call_18067922",
    "f76280b1-1058-4e49-8e5f-4914f9a3f390",
    "Tree6 Trunk",
    1000,
    400,
    28,
    190,
    TRUNK,
  ),
  frame(
    "call_74591267",
    "f1f82330-7cb9-44d1-a34a-e280c63cfaf4",
    "Tree6 Leaves",
    940,
    260,
    140,
    140,
    LEAVES,
    70,
  ),
  frame(
    "call_38968303",
    "3e165fce-d0bf-4f6c-903d-594e5a038978",
    "Tree7 Trunk",
    200,
    450,
    32,
    200,
    TRUNK,
  ),
  frame(
    "call_41849280",
    "0fe979b5-6821-4632-a25c-d7e84753f091",
    "Tree7 Leaves",
    140,
    310,
    160,
    160,
    LEAVES,
    80,
  ),
  frame(
    "call_69577797",
    "432e74c5-f900-44ec-a473-effda7fd3297",
    "Tree8 Trunk",
    600,
    420,
    35,
    210,
    TRUNK,
  ),
  frame(
    "call_62547575",
    "b8328f36-5672-46a1-953f-325666e61565",
    "Tree8 Leaves",
    540,
    260,
    170,
    170,
    LEAVES,
    85,
  ),
  text(
    "call_55605683",
    "b0161a80-7e2d-45bc-a4bf-ee38f767f53d",
    "Poster Subtitle",
    130,
    40,
    "A Majestic Forest Scene",
    24,
    0.5,
    "normal",
  ),
];

export const demoTransport = new StaticChatTransport<ChatUIMessage>({
  chunkDelayMs: [50, 200],
  async *mockResponse() {
    for (const { toolName, callId, block, dataPart } of scriptedBlocks) {
      const { id, ...input } = block;

      yield { type: "step-start" };

      yield {
        type: `tool-${toolName}`,
        toolName,
        toolCallId: callId,
        state: "input-available",
        input,
      };

      yield {
        type: `tool-${toolName}`,
        toolName,
        toolCallId: callId,
        state: "output-available",
        input,
        output: `Successfully generated ${block.type} block "${block.label}" with ID ${id}.`,
      };

      yield dataPart;
    }
  },
});
