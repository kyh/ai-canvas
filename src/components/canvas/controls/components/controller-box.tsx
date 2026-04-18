import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface ControllerBoxProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  borderTop?: boolean;
  className?: string;
  itemClassName?: string;
  contentClassName?: string;
}

const ControllerBox = React.forwardRef<HTMLDivElement, ControllerBoxProps>(
  (
    {
      title,
      children,
      defaultOpen = true,
      borderTop = true,
      className,
      itemClassName,
      contentClassName,
    },
    ref
  ) => {
    const generatedId = React.useId().replace(/[:]/g, "");

    return (
      <Accordion
        multiple={false}
        className={cn("px-4", className)}
        defaultValue={defaultOpen ? [generatedId] : []}
      >
        <AccordionItem
          ref={ref}
          value={generatedId}
          className={cn(
            "border-border",
            {
              "border-t": borderTop,
            },
            itemClassName
          )}
        >
          <AccordionTrigger className="text-sm font-semibold">
            {title}
          </AccordionTrigger>
          <AccordionContent
            className={cn("flex flex-col gap-2.5", contentClassName)}
          >
            {children}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }
);

ControllerBox.displayName = "ControllerBox";

export default ControllerBox;
