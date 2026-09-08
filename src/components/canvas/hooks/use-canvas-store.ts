import { useMemo } from "react";
import { useEditorStore } from "../use-editor";
import { useShallow } from "zustand/react/shallow";
import { useOrderedBlocks } from "./use-ordered-blocks";

export const useCanvasStore = () => {
  // Use the reusable hook for stable blocks reference
  const blocks = useOrderedBlocks();

  // Select other state with useShallow
  const state = useEditorStore(
    useShallow((s) => ({
      background: s.canvas.background,
      containerSize: s.canvas.containerSize,
      hoveredId: s.hoveredId,
      isTextEditing: s.canvas.isTextEditing,
      mode: s.canvas.mode,
      selectedIds: s.selectedIds,
      size: s.canvas.size,
      stagePosition: s.canvas.stagePosition,
      zoom: s.canvas.zoom,
    })),
  );

  // Select actions - these are stable function references
  const actions = useEditorStore(
    useShallow((s) => ({
      addArrowBlock: s.addArrowBlock,
      addFrameBlock: s.addFrameBlock,
      addImageBlock: s.addImageBlock,
      addTextBlock: s.addTextBlock,
      deleteSelectedBlocks: s.deleteSelectedBlocks,
      setBlockPosition: s.setBlockPosition,
      setCanvasContainerSize: s.setCanvasContainerSize,
      setHoveredId: s.setHoveredId,
      setIsTextEditing: s.setIsTextEditing,
      setMode: s.setMode,
      setSelectedIds: s.setSelectedIds,
      setStage: s.setStage,
      setStagePosition: s.setStagePosition,
      setStageZoom: s.setStageZoom,
      updateBlockValues: s.updateBlockValues,
    })),
  );

  // Combine with stable blocks reference
  return useMemo(
    () => ({
      blocks,
      ...state,
      ...actions,
    }),
    [blocks, state, actions],
  );
};
