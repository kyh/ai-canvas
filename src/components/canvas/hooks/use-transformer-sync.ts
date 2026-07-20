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
    const nodes = selectedIds
      .map((id) => stage.findOne(`#${blockNodeId(id)}`))
      .filter((node): node is Konva.Node => Boolean(node));
    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [blocks, selectedIds, stageRef, transformerRef]);
};
