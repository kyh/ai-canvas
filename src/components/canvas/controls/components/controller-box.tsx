import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "cn";

interface ControllerBoxProps {
  ref?: React.Ref<HTMLDivElement>;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  borderTop?: boolean;
  className?: string;
  itemClassName?: string;
  contentClassName?: string;
}

const ControllerBox = ({
  title,
  children,
  defaultOpen = true,
  borderTop = true,
  className,
  itemClassName,
  contentClassName,
  ref,
}: ControllerBoxProps) => {
  const generatedId = React.useId().replaceAll(":", "");

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
          itemClassName,
        )}
      >
        <AccordionTrigger className="text-sm font-semibold">{title}</AccordionTrigger>
        <AccordionContent className={cn("flex flex-col gap-2.5", contentClassName)}>
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ControllerBox;
