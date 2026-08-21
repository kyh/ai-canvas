import * as React from "react";
import type Konva from "konva";
import type { IEditorBlocks } from "@/lib/schema";
import { blockNodeId } from "../utils";

export const useTransformerSync = (
  stageRef: React.RefObject<Konva.Stage | null>,
  transformerRef: React.RefObject<Konva.Transformer | null>,
  blocks: IEditorBlocks[],
  selectedIds: string[],
) => {
  React.useEffect(() => {
    const stage = stageRef.current;
    const transformer = transformerRef.current;
    if (!stage || !transformer) {
      return;
    }
    // Resolve through `blocks` so the transformer re-attaches after react-konva
    // has (re)mounted the nodes, and never holds one whose block is gone.
    const nodes = blocks
      .filter((block) => selectedIds.includes(block.id))
      .map((block) => stage.findOne(`#${blockNodeId(block.id)}`))
      .filter((node): node is Konva.Node => Boolean(node));
    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [blocks, selectedIds, stageRef, transformerRef]);
};
