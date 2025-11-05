import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import LayoutController from "../controls/layout-controller";
import TextController from "../controls/text-controller";
import LayerController from "../controls/layer-controller";
import CanvasController from "../controls/canvas-controller";
import { useEditorStore } from "../use-editor";
import type { IEditorBlockText } from "@/lib/schema";

function EditorRightSide({ className }: { className?: string }) {
  const [, activeBlock] = useEditorStore(
    (state) => {
      if (state.selectedIds.length === 1) {
        const id = state.selectedIds[0];
        return [id, state.blocksById[id] ?? null] as const;
      }
      return [null, null] as const;
    },
    (prev, next) => prev[0] === next[0] && prev[1] === next[1]
  );
  const blockType = activeBlock?.type ?? null;
  return (
    <div
      className={cn(
        "fixed right-3 top-3 bottom-3 z-20 flex w-64 flex-col border border-border/50 bg-background/95 backdrop-blur shadow-xl rounded-[1.25rem] overflow-hidden",
        className
      )}
    >
      <ScrollArea>
        {activeBlock && blockType ? (
          <>
            <LayoutController blockId={activeBlock.id} />
            {blockType === "text" ? (
              <TextController
                blockId={activeBlock.id}
                block={activeBlock as IEditorBlockText}
              />
            ) : null}
            <LayerController blockId={activeBlock.id} />
          </>
        ) : (
          <CanvasController />
        )}
      </ScrollArea>
    </div>
  );
}

export default EditorRightSide;
