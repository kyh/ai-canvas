import * as React from "react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

interface NumberInputProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  leftChild?: React.ReactNode;
  className?: string;
}

const NumberInput = ({
  value,
  onChange,
  min,
  max,
  step,
  leftChild,
  className,
}: NumberInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      return;
    }
    const numValue = Number(e.target.value);
    if (!Number.isNaN(numValue)) {
      onChange?.(numValue);
    }
  };

  return (
    <InputGroup className={className}>
      {leftChild && <InputGroupAddon>{leftChild}</InputGroupAddon>}
      <InputGroupInput
        type="number"
        value={value ?? ""}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
      />
    </InputGroup>
  );
};

export { NumberInput };
