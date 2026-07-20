import { useMemo } from "react";
import { useEditorStore } from "../use-editor";

/**
 * Hook to get ordered blocks with stable reference.
 * Selects blockOrder and blocksById separately to avoid creating
 * new array references on every render, preventing infinite loops
 * with Zustand v5's useSyncExternalStore.
 */
export const useOrderedBlocks = () => {
  const blockOrder = useEditorStore((state) => state.blockOrder);
  const blocksById = useEditorStore((state) => state.blocksById);

  return useMemo(
    () => blockOrder.map((id) => blocksById[id]).filter(Boolean),
    [blockOrder, blocksById],
  );
};
