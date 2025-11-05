import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { TriangleDownIcon, TriangleUpIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full border border-border rounded-lg bg-muted/50 transition-colors file:border-0 file:bg-transparent file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        lg: "h-9 px-3 py-1 text-sm file:text-sm",
        sm: "h-7 px-1.5 py-1 text-xs file:text-xs",
      },
    },
    defaultVariants: {
      variant: "sm",
    },
  },
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  leftChild?: React.ReactNode;
  rightChild?: React.ReactNode;
  plusNumber?: () => void;
  minusNumber?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant,
      leftChild,
      rightChild,
      plusNumber,
      minusNumber,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="w-full flex items-center relative inputWrapper">
        {leftChild && (
          <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center h-7 w-5">
            {leftChild}
          </div>
        )}
        <input
          type={type}
          className={cn(inputVariants({ variant, className }), {
            "pl-5": leftChild !== undefined,
            "pr-5": rightChild !== undefined,
          })}
          ref={ref}
          {...props}
        />
        {rightChild ? (
          <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center h-7 w-5">
            {rightChild}
          </div>
        ) : (
          <>
            {type === "number" && (
              <div className="flex-col z-2 bg-gray border-l border-foreground/5 items-center justify-center absolute right-[2px] top-[1px] bottom-[1px] hidden numberHandlers rounded-tr-[3px] rounded-br-[3px]">
                <div
                  onClick={plusNumber}
                  onKeyDown={plusNumber}
                  role="presentation"
                  className="cursor-pointer pt-[4px] opacity-50 border-b border-foreground/15"
                >
                  <TriangleUpIcon className="w-3 h-3" />
                </div>
                <div
                  onClick={minusNumber}
                  onKeyDown={minusNumber}
                  role="presentation"
                  className="cursor-pointer pb-[4px] opacity-50"
                >
                  <TriangleDownIcon className="w-3 h-3" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export function NumberInput({
  onChange,
  value,
  leftChild,
  className,
  min,
  max,
}: {
  onChange: (value: number) => void;
  value?: number;
  leftChild?: React.ReactNode;
  className?: string;
  min?: number;
  max?: number;
}) {
  return (
    <Input
      type="number"
      onChange={(e) => {
        const newValue = e.target.value;
        if (/^-?\d*\.?\d*$/.test(newValue)) {
          onChange(parseFloat(newValue));
        }
      }}
      min={min}
      max={max}
      value={value}
      leftChild={leftChild}
      className={className}
      plusNumber={() => {
        if (max === undefined) {
          onChange((value || 0) + 1);
        } else if (max !== value) {
          onChange((value || 0) + 1);
        }
      }}
      minusNumber={() => {
        if (min === undefined) {
          onChange((value || 0) - 1);
        } else if (min !== value) {
          onChange((value || 0) - 1);
        }
      }}
      onBlur={() => {
        if (!value) {
          onChange(value || 0);
        }
      }}
    />
  );
}

export { Input };
