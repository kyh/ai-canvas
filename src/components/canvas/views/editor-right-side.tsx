import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import LayoutController from "../controls/layout-controller";
import TextController from "../controls/text-controller";
import LayerController from "../controls/layer-controller";
import CanvasController from "../controls/canvas-controller";
import { useEditorStore } from "../use-editor";

function EditorRightSide({ className }: { className?: string }) {
  // Select separately to avoid creating new array references
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const blocksById = useEditorStore((state) => state.blocksById);

  // Compute active block with stable reference
  const activeBlock = useMemo(() => {
    if (selectedIds.length === 1) {
      return blocksById[selectedIds[0]] ?? null;
    }
    return null;
  }, [selectedIds, blocksById]);
  const blockType = activeBlock?.type ?? null;
  return (
    <div
      className={cn(
        "fixed right-3 top-3 bottom-3 z-20 hidden md:flex w-64 flex-col border border-border/50 bg-background/95 backdrop-blur shadow-xl rounded-[1.25rem] overflow-hidden",
        className,
      )}
    >
      <ScrollArea>
        {activeBlock && blockType ? (
          <>
            <LayoutController blockId={activeBlock.id} />
            {activeBlock.type === "text" ? (
              <TextController blockId={activeBlock.id} block={activeBlock} />
            ) : null}
            {blockType !== "text" && <LayerController blockId={activeBlock.id} />}
          </>
        ) : (
          <CanvasController />
        )}
      </ScrollArea>
    </div>
  );
}

export default EditorRightSide;
