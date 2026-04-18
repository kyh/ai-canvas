import * as React from "react";
import { NumberInput } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X as Cross2Icon } from "lucide-react";
import ControllerRow from "./controller-row";
import ColorControl from "./color-control";
import { useEditorStore } from "@/components/canvas/use-editor";

interface ShadowControlProps {
  blockId: string;
  className?: string;
}

function ShadowControl({ blockId, className }: ShadowControlProps) {
  const block = useEditorStore((state) => state.blocksById[blockId]);
  const updateBlockValues = useEditorStore((state) => state.updateBlockValues);
  const [open, setOpen] = React.useState(false);

  if (!block) {
    return null;
  }

  const shadow = block.shadow;

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    updateBlockValues(blockId, { shadow: undefined });
    setOpen(false);
  };

  const ensureShadow = () => {
    if (shadow) {
      return;
    }
    updateBlockValues(blockId, {
      shadow: {
        color: "#00000044",
        offsetX: 0,
        offsetY: 12,
        blur: 24,
        enabled: true,
      },
    });
  };

  return (
    <ControllerRow
      label="Shadow"
      className={className}
      contentClassName="justify-between"
    >
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative w-full">
          <PopoverTrigger
            render={
              <button
                type="button"
                onClick={ensureShadow}
                className="flex h-7 w-full items-center justify-between rounded-md border border-border bg-muted px-1 pr-7 text-xs transition hover:border-primary"
              />
            }
          >
            <span className="flex items-center gap-2">
              <span
                className="h-5 w-5 rounded-sm border border-border"
                style={{ background: shadow?.color ?? "transparent" }}
              />
              {shadow ? (
                <span className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {shadow.offsetX ?? 0}px, {shadow.offsetY ?? 0}px
                </span>
              ) : (
                <span className="opacity-50">Add…</span>
              )}
            </span>
          </PopoverTrigger>
          {shadow ? (
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
            <p className="text-xs font-semibold">Shadow</p>
            <button
              type="button"
              className="-mr-1 rounded p-1 text-foreground/60 hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              <Cross2Icon className="h-3.5 w-3.5" />
            </button>
          </div>
          {shadow ? (
            <div className="flex flex-col gap-2.5">
              <ControllerRow label="Enabled" contentClassName="justify-end">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border border-border"
                  checked={shadow.enabled !== false}
                  onChange={(event) => {
                    updateBlockValues(blockId, {
                      shadow: {
                        ...shadow,
                        enabled: event.target.checked,
                      },
                    });
                  }}
                />
              </ControllerRow>
              <ColorControl
                name="Color"
                value={shadow.color}
                disableGradient
                onChange={(color) => {
                  updateBlockValues(blockId, {
                    shadow: {
                      ...shadow,
                      color,
                    },
                  });
                }}
              />
              <ControllerRow label="Offset" contentClassName="gap-3">
                <NumberInput
                  value={shadow.offsetX ?? 0}
                  onChange={(value) => {
                    updateBlockValues(blockId, {
                      shadow: {
                        ...shadow,
                        offsetX: value,
                      },
                    });
                  }}
                />
                <NumberInput
                  value={shadow.offsetY ?? 0}
                  onChange={(value) => {
                    updateBlockValues(blockId, {
                      shadow: {
                        ...shadow,
                        offsetY: value,
                      },
                    });
                  }}
                />
              </ControllerRow>
              <ControllerRow label="Blur">
                <NumberInput
                  min={0}
                  value={shadow.blur ?? 0}
                  onChange={(value) => {
                    updateBlockValues(blockId, {
                      shadow: {
                        ...shadow,
                        blur: value,
                      },
                    });
                  }}
                />
              </ControllerRow>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </ControllerRow>
  );
}

export default ShadowControl;
