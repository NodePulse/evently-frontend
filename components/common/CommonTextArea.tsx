import React from "react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface CommonTextAreaProps {
    title: string;
    name: string;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    rows?: number;
    value: string;
    error?: string;
    touched?: boolean;
}

const CommonTextArea: React.FC<CommonTextAreaProps> = ({title, name, placeholder, onChange, onBlur, rows = 5, value, error, touched}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{title}</Label>
      <Textarea
        id={name}
        name={name}
        placeholder={placeholder}
        rows={rows}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
      />
      {touched && error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default CommonTextArea;
