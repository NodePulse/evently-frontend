// components/ChangeProfileImageModal.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { updateProfileImageFn } from "@/constants/api";

interface ChangeProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage?: string;
}

export const ChangeProfileImageModal: React.FC<ChangeProfileImageModalProps> = ({ isOpen, onClose, currentImage }) => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: updateProfileImageFn,
    onSuccess: () => {
      toast.success("Profile image updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      onClose();
      // Reset state for next time modal opens
      setSelectedFile(null);
      setImagePreviewUrl(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update image.");
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("image", selectedFile);
      mutate(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile Image</DialogTitle>
          <DialogDescription>
            This image will be displayed publicly on your profile.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          <Avatar className="h-40 w-40">
            <AvatarImage src={imagePreviewUrl || currentImage} />
            <AvatarFallback className="text-4xl">PIC</AvatarFallback>
          </Avatar>
          <Button asChild variant="outline">
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Change Image
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!selectedFile || isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};