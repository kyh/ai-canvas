import * as React from "react";
import { X as Cross2Icon } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ControllerRow from "./controller-row";
import CustomColorPicker from "./color-picker";

interface ColorControlProps {
  name: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  disableGradient?: boolean;
  className?: string;
}

function ColorControl({
  name,
  onChange,
  value,
  disableGradient,
  className,
}: ColorControlProps) {
  const [open, setOpen] = React.useState(false);
  const onClick = () => {
    if (!value) {
      onChange("#000000");
    }
  };

  const handleClear = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    onChange(undefined);
    setOpen(false);
  };

  return (
    <ControllerRow label={name} className={className}
      contentClassName="justify-between">
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative w-full">
          <PopoverTrigger
            render={
              <button
                type="button"
                onClick={onClick}
                className="flex h-7 w-full items-center justify-between rounded-md border border-border bg-muted px-1 pr-7 text-xs transition hover:border-primary"
              />
            }
          >
            <div className="flex items-center gap-2">
              <div
                className="h-5 w-5 rounded-sm border border-border bg-foreground/20"
                style={{
                  ...(value ? { background: value } : {}),
                }}
              />
              {value ? (
                <p className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {value?.includes("gradient") ? "Gradient" : value}
                </p>
              ) : (
                <p className="opacity-50">Add...</p>
              )}
            </div>
          </PopoverTrigger>
          {value && (
            <button
              type="button"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-foreground/60 transition hover:bg-accent"
              onClick={handleClear}
            >
              <Cross2Icon className="h-3 w-3 opacity-50" />
            </button>
          )}
        </div>
        <PopoverContent
          align="center"
          className="w-[293px]"
          side="left"
        >
          <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
            <p className="text-xs font-semibold capitalize">{name}</p>
            <button
              type="button"
              className="-mr-1 rounded p-1 text-foreground/60 hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              <Cross2Icon className="h-3.5 w-3.5" />
            </button>
          </div>
          <CustomColorPicker
            value={value}
            onChange={onChange}
            disableGradient={disableGradient}
          />
        </PopoverContent>
      </Popover>
    </ControllerRow>
  );
}

export default ColorControl;
