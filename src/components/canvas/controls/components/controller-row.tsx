import * as React from "react";
import { cn } from "cn";

interface ControllerRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  labelClassName?: string;
  contentClassName?: string;
}

const ControllerRow = React.forwardRef<HTMLDivElement, ControllerRowProps>(
  ({ label, children, className, labelClassName, contentClassName, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2.5 pl-2 text-xs text-foreground/70", className)}
        {...props}
      >
        {label ? (
          <span
            className={cn(
              "min-w-[60px] text-left font-medium text-muted-foreground",
              labelClassName,
            )}
          >
            {label}
          </span>
        ) : null}
        <div className={cn("flex flex-1 items-center justify-end gap-2", contentClassName)}>
          {children}
        </div>
      </div>
    );
  },
);

ControllerRow.displayName = "ControllerRow";

export default ControllerRow;
