import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import CustomTooltip from "./tooltip";

interface ButtonsGroupProps {
  buttons: {
    children: React.ReactNode;
    onClick?: () => void;
    isActive?: boolean;
    label: string;
    disabled?: boolean;
  }[];
}

function ButtonsGroup(props: ButtonsGroupProps) {
  const { buttons } = props;
  return (
    <div className="flex items-center gap-2">
      {buttons.map((button, index) => (
        <CustomTooltip key={index} content={button.label}>
          <Button
            onClick={button.onClick}
            variant="ghost"
            disabled={button.disabled}
            className={cn(
              "size-10 text-lg flex items-center justify-center p-0 rounded-xl border transition-all",
              "hover:bg-muted/80",
              {
                "bg-muted border-border/80 shadow-[0_-1px_3px_0px_rgba(18,18,18,0.15)_inset,_0px_1.25px_1px_0px_#FFF_inset] dark:shadow-[0_-1px_3px_0px_rgba(255,255,255,0.05)_inset,_0px_1.25px_1px_0px_rgba(255,255,255,0.1)_inset]":
                  button.isActive,
                "border-transparent":
                  !button.isActive,
              },
            )}
          >
            {button.children}
          </Button>
        </CustomTooltip>
      ))}
    </div>
  );
}

export default ButtonsGroup;
