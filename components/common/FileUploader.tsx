import React from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const FileUploader = ({
  label,
  preview,
  rootProps,
  inputProps,
  isDragActive,
  onRemove,
  icon: Icon,
  error,
  isVideo = false,
}: any) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {preview ? (
      <div className="relative group">
        {isVideo ? (
          <video
            src={preview}
            controls
            className="rounded-md object-cover w-full h-auto max-h-64 border"
          />
        ) : (
          <img
            src={preview}
            alt="Preview"
            className="rounded-md object-cover w-full h-auto max-h-64 border"
          />
        )}
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    ) : (
      <div
        {...rootProps}
        className={cn(
          "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/10"
            : "hover:border-primary/50"
        )}
      >
        <input {...inputProps} />
        <div className="p-3 bg-muted rounded-full mb-2">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          {isDragActive ? "Drop here..." : "Drag & drop or click to upload"}
        </p>
      </div>
    )}
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

export default FileUploader;
