import * as React from "react";
import { NumberInput } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X as Cross2Icon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ControllerRow from "./controller-row";
import ColorControl from "./color-control";
import { useEditorStore } from "@/components/canvas/use-editor";

interface BorderControlProps {
  blockId: string;
  className?: string;
}

const DASH_PRESETS: Record<string, number[] | undefined> = {
  solid: undefined,
  dashed: [12, 8],
  dotted: [2, 6],
};

const getDashKey = (dash?: number[]) => {
  if (!dash || dash.length === 0) return "solid";
  if (dash[0] === 12) return "dashed";
  if (dash[0] === 2) return "dotted";
  return "custom";
};

function BorderControl({ blockId, className }: BorderControlProps) {
  const block = useEditorStore((state) => state.blocksById[blockId]);
  const updateBlockValues = useEditorStore((state) => state.updateBlockValues);
  const [open, setOpen] = React.useState(false);

  if (!block) {
    return null;
  }

  const border = block.border;

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    updateBlockValues(blockId, { border: undefined });
    setOpen(false);
  };

  const ensureBorder = () => {
    if (border) {
      return;
    }
    updateBlockValues(blockId, {
      border: {
        color: "#1f2933",
        width: 1,
        dash: undefined,
      },
    });
  };

  return (
    <ControllerRow
      label="Border"
      className={className}
      contentClassName="justify-between"
    >
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative w-full">
          <PopoverTrigger
            render={
              <button
                type="button"
                onClick={ensureBorder}
                className="flex h-7 w-full items-center justify-between rounded-md border border-border bg-muted px-1 pr-7 text-xs transition hover:border-primary"
              />
            }
          >
            <span className="flex items-center gap-2">
              <span
                className="h-5 w-5 rounded-sm border border-border"
                style={{ background: border?.color ?? "transparent" }}
              />
              {border ? (
                <span className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {border.width ?? 0}px
                </span>
              ) : (
                <span className="opacity-50">Add…</span>
              )}
            </span>
          </PopoverTrigger>
          {border ? (
            <button
              type="button"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-foreground/60 transition hover:bg-accent"
              onClick={handleClear}
            >
              <Cross2Icon className="h-3 w-3" />
            </button>
          ) : null}
        </div>
        <PopoverContent align="center" side="left" className="w-[280px]">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
            <p className="text-xs font-semibold">Border</p>
            <button
              type="button"
              className="-mr-1 rounded p-1 text-foreground/60 hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              <Cross2Icon className="h-3.5 w-3.5" />
            </button>
          </div>
          {border ? (
            <div className="flex flex-col gap-2.5">
              <ColorControl
                name="Color"
                value={border.color}
                disableGradient
                onChange={(color) => {
                  updateBlockValues(blockId, {
                    border: {
                      ...border,
                      color,
                    },
                  });
                }}
              />
              <ControllerRow label="Width">
                <NumberInput
                  min={0}
                  value={border.width ?? 0}
                  onChange={(value) => {
                    updateBlockValues(blockId, {
                      border: {
                        ...border,
                        width: value,
                      },
                    });
                  }}
                />
              </ControllerRow>
              <ControllerRow label="Style">
                <Tabs
                  value={getDashKey(border.dash)}
                  onValueChange={(value) => {
                    updateBlockValues(blockId, {
                      border: {
                        ...border,
                        dash: DASH_PRESETS[value] ?? border.dash,
                      },
                    });
                  }}
                >
                  <TabsList className="grid h-8 grid-cols-3">
                    <TabsTrigger value="solid">Solid</TabsTrigger>
                    <TabsTrigger value="dashed">Dashed</TabsTrigger>
                    <TabsTrigger value="dotted">Dotted</TabsTrigger>
                  </TabsList>
                </Tabs>
              </ControllerRow>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </ControllerRow>
  );
}

export default BorderControl;
