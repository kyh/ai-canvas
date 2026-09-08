import { NumberInput } from "@/components/ui/number-input";
import { cn } from "cn";
import ControllerRow from "./components/controller-row";
import { useEditorStore } from "@/components/canvas/use-editor";

const LayoutController = ({ blockId, className }: { blockId: string; className?: string }) => {
  const block = useEditorStore((state) => state.blocksById[blockId]);
  const updateBlockValues = useEditorStore((state) => state.updateBlockValues);
  if (!block) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-2.5 p-4", className)}>
      <p className="mb-1 text-sm font-semibold">Layout</p>

      <ControllerRow label="Position" contentClassName="gap-3">
        <NumberInput
          leftChild={<span className="text-xs text-muted-foreground">X</span>}
          value={block?.x}
          onChange={(value) => {
            updateBlockValues(blockId, {
              x: value,
            });
          }}
        />
        <NumberInput
          leftChild={<span className="text-xs text-muted-foreground">Y</span>}
          value={block?.y}
          onChange={(value) => {
            updateBlockValues(blockId, {
              y: value,
            });
          }}
        />
      </ControllerRow>

      <ControllerRow label="Size" contentClassName="gap-3">
        <NumberInput
          leftChild={<span className="text-xs text-muted-foreground">W</span>}
          value={block?.width}
          min={2}
          onChange={(value) => {
            if (Number.isNaN(value) || !block) {
              return;
            }
            if (block.type === "image") {
              const aspectRatio = block.width / block.height;
              updateBlockValues(blockId, {
                height: Number((value / aspectRatio).toFixed(1)),
                width: value,
              });
            } else {
              updateBlockValues(blockId, { width: value });
            }
          }}
        />
        <NumberInput
          leftChild={<span className="text-xs text-muted-foreground">H</span>}
          value={block?.height}
          min={2}
          onChange={(value) => {
            if (Number.isNaN(value) || !block) {
              return;
            }
            if (block.type === "image") {
              const aspectRatio = block.width / block.height;
              updateBlockValues(blockId, {
                height: value,
                width: Number((value * aspectRatio).toFixed(1)),
              });
            } else {
              updateBlockValues(blockId, { height: value });
            }
          }}
        />
      </ControllerRow>

      <ControllerRow label="Rotate" contentClassName="gap-3">
        <NumberInput
          value={block?.rotation ?? 0}
          onChange={(value) => {
            if (!block) {
              return;
            }
            updateBlockValues(blockId, {
              rotation: value,
            });
          }}
        />
      </ControllerRow>

      <ControllerRow label="Scale" contentClassName="gap-3">
        <NumberInput
          leftChild={<span className="text-xs text-muted-foreground">X</span>}
          value={block?.scaleX ?? 1}
          step={0.1}
          min={0.1}
          onChange={(value) => {
            if (!block) {
              return;
            }
            updateBlockValues(blockId, {
              scaleX: value,
            });
          }}
        />
        <NumberInput
          leftChild={<span className="text-xs text-muted-foreground">Y</span>}
          value={block?.scaleY ?? 1}
          step={0.1}
          min={0.1}
          onChange={(value) => {
            if (!block) {
              return;
            }
            updateBlockValues(blockId, {
              scaleY: value,
            });
          }}
        />
      </ControllerRow>
    </div>
  );
};

export default LayoutController;
