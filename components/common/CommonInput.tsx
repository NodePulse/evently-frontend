import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface CommonInputProps {
  name: string;
  label?: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  value: string;
  error?: string;
  touched?: boolean;
  type: "text" | "number" | "email" | "password";
  className?: string;
}

const CommonInput: React.FC<CommonInputProps> = ({
  touched,
  label,
  name,
  placeholder,
  onChange,
  onBlur,
  value,
  error,
  type,
  className
}) => {
  return (
    <div className="space-y-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        className={className}
      />
      {touched && error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default CommonInput;
