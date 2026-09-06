import { FlipHorizontal, FlipVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import ControllerRow from "./controller-row";
import { useEditorStore } from "@/components/canvas/use-editor";

interface FlipControlProps {
  blockId: string;
  className?: string;
}

function FlipControl({ blockId, className }: FlipControlProps) {
  const block = useEditorStore((state) => state.blocksById[blockId]);
  const updateBlockValues = useEditorStore((state) => state.updateBlockValues);
  if (!block) {
    return null;
  }
  return (
    <ControllerRow label="Flip" className={className} contentClassName="gap-2">
      <Button
        variant="outline"
        size="icon"
        className={cn("h-7 w-7", {
          "bg-border hover:bg-border": block.flip?.horizontal,
        })}
        onClick={() => {
          updateBlockValues(blockId, {
            flip: {
              ...block.flip,
              horizontal: !block.flip?.horizontal,
            },
          });
        }}
      >
        <FlipHorizontal />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={cn("h-7 w-7", {
          "bg-border hover:bg-border": block.flip?.vertical,
        })}
        onClick={() => {
          updateBlockValues(blockId, {
            flip: {
              ...block.flip,
              vertical: !block.flip?.vertical,
            },
          });
        }}
      >
        <FlipVertical />
      </Button>
    </ControllerRow>
  );
}

export default FlipControl;
