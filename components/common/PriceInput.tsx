"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PriceInputProps {
  label?: string;
  name: string;
  currencyName?: string;
  value: number | string;
  currency: string;
  onPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCurrencyChange: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder: string[];
  options: {
    label: string;
    value: string;
  }[];
}

const PriceInput: React.FC<PriceInputProps> = ({
  label = "Price",
  name,
  currencyName = "currency",
  value,
  currency,
  onPriceChange,
  onCurrencyChange,
  onBlur,
  error,
  touched,
  disabled,
  className,
  placeholder,
  options,
}) => {
  const displayError = touched && error;

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={name}>{label}</Label>}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Input
          id={name}
          name={name}
          type="number"
          placeholder={placeholder[0]}
          min="0"
          step="0.01"
          value={value}
          onChange={onPriceChange}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full sm:flex-1"
        />
        <Select
          name={currencyName}
          onValueChange={onCurrencyChange}
          value={currency}
          disabled={disabled}
        >
          <SelectTrigger className="sm:w-[130px] w-full">
            <SelectValue placeholder={placeholder[1]} />
          </SelectTrigger>
          <SelectContent>
            {options.length > 0 &&
              options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {displayError && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
};

export default PriceInput;
