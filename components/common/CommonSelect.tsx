"use client";

import React from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface CommonSelectProps {
  label?: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  options: { label: string; value: string }[];
  className?: string;
}

const CommonSelect: React.FC<CommonSelectProps> = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  options,
  className,
}) => {
  const displayError = touched && error;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <Label htmlFor={name}>{label}</Label>}

      <Select
        name={name}
        value={value}
        onValueChange={(val) => onChange(val)}
        onOpenChange={() => onBlur?.()} // call onBlur when dropdown closes
      >
        <SelectTrigger id={name} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options.map((option) => (
            <SelectItem value={option.value} key={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {displayError && (
        <span className="text-xs text-destructive">{error}</span>
      )}
    </div>
  );
};

export default CommonSelect;
