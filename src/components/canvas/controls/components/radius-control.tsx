import { NumberInput } from "@/components/ui/input";
import ControllerRow from "./controller-row";
import { useEditorStore } from "@/components/canvas/use-editor";
import type { IEditorBlocks } from "@/lib/schema";

interface RadiusControlProps {
  blockId: string;
  className?: string;
}

const getRadius = (block?: IEditorBlocks) => {
  const defaults = { tl: 0, tr: 0, br: 0, bl: 0 } as const;
  if (!block?.radius) {
    return defaults;
  }
  return {
    tl: block.radius.tl ?? 0,
    tr: block.radius.tr ?? 0,
    br: block.radius.br ?? 0,
    bl: block.radius.bl ?? 0,
  } as const;
};

function RadiusControl({ blockId, className = "flex flex-col gap-2" }: RadiusControlProps) {
  const block = useEditorStore((state) => state.blocksById[blockId]);
  const updateBlockValues = useEditorStore((state) => state.updateBlockValues);
  if (!block) {
    return null;
  }
  const radius = getRadius(block);

  const setAllCorners = (value: number) => {
    updateBlockValues(blockId, {
      radius: {
        tl: value,
        tr: value,
        br: value,
        bl: value,
      },
    });
  };

  const updateCorner = (corner: keyof typeof radius, value: number) => {
    updateBlockValues(blockId, {
      radius: {
        ...radius,
        [corner]: value,
      },
    });
  };

  return (
    <div className={className}>
      <ControllerRow label="Radius" contentClassName="gap-3">
        <NumberInput
          min={0}
          value={(radius.tl + radius.tr + radius.br + radius.bl) / 4}
          onChange={(value) => {
            setAllCorners(value);
          }}
        />
      </ControllerRow>
      <ControllerRow label="Corners" contentClassName="grid grid-cols-2 gap-2">
        <NumberInput
          min={0}
          value={radius.tl}
          onChange={(value) => updateCorner("tl", value)}
          leftChild={<span className="text-xs text-muted-foreground">TL</span>}
        />
        <NumberInput
          min={0}
          value={radius.tr}
          onChange={(value) => updateCorner("tr", value)}
          leftChild={<span className="text-xs text-muted-foreground">TR</span>}
        />
        <NumberInput
          min={0}
          value={radius.br}
          onChange={(value) => updateCorner("br", value)}
          leftChild={<span className="text-xs text-muted-foreground">BR</span>}
        />
        <NumberInput
          min={0}
          value={radius.bl}
          onChange={(value) => updateCorner("bl", value)}
          leftChild={<span className="text-xs text-muted-foreground">BL</span>}
        />
      </ControllerRow>
    </div>
  );
}

export default RadiusControl;
