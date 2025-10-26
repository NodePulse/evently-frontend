import dynamic from "next/dynamic";
import React from "react";
import "react-quill-new/dist/quill.snow.css";
import { cn } from "@/lib/utils";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });


interface TextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  errors?: string;
  touched?: boolean;
  className?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({value, onChange, placeholder, touched, errors, className}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={{
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "blockquote"],
            ["clean"],
          ],
        }}
        className={cn(
          "flex h-52 flex-col [&_.ql-editor]:min-h-[10rem] [&_.ql-editor]:text-base [&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:flex-grow [&_.ql-container]:overflow-y-auto [&_.ql-container]:rounded-b-lg",
          "[&_.ql-toolbar]:border-input [&_.ql-container]:border-input [&_.ql-editor]:p-4"
        )}
      />
      {touched && errors && (
        <p className="text-sm text-destructive pt-2">{errors}</p>
      )}
    </div>
  );
};

export default TextEditor;
