'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

// --- Type Definition ---
// Assuming a User type like this
interface User {
  name: string;
  bio?: string | null;
  location?: string | null;
  socialLinks?: {
    twitter?: string | null;
    linkedin?: string | null;
  } | null;
}

// --- API Function ---
const updateUserProfileFn = async (values: Partial<User>) => {
  const response = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update profile.');
  }
  return response.json();
};

// --- Validation Schema ---
const profileValidationSchema = Yup.object({
  name: Yup.string().min(2, "Name is too short").required("Name is required"),
  bio: Yup.string().max(160, "Bio cannot be more than 160 characters"),
  location: Yup.string(),
  twitter: Yup.string().url("Please enter a valid URL").nullable(),
  linkedin: Yup.string().url("Please enter a valid URL").nullable(),
});

// --- Main Modal Component ---
export const EditProfileModal = ({ user, isOpen, onClose }: { user: User; isOpen: boolean; onClose: () => void; }) => {
  const queryClient = useQueryClient();

  const { mutate: updateUser, isPending } = useMutation({
    mutationFn: updateUserProfileFn,
    onSuccess: (data) => {
      toast.success(data.message);
      // Invalidate the user profile query to refetch the data and update the UI
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      onClose(); // Close the modal
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const formik = useFormik({
    initialValues: {
      name: user.name || '',
      bio: user.bio || '',
      location: user.location || '',
      twitter: user.socialLinks?.twitter || '',
      linkedin: user.socialLinks?.linkedin || '',
    },
    validationSchema: profileValidationSchema,
    onSubmit: (values) => {
      updateUser(values);
    },
    enableReinitialize: true, // This ensures the form updates if the user prop changes
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={formik.handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {formik.touched.name && formik.errors.name && <p className="text-sm text-destructive">{formik.errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" value={formik.values.bio} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {formik.touched.bio && formik.errors.bio && <p className="text-sm text-destructive">{formik.errors.bio}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" value={formik.values.location} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter URL</Label>
              <Input id="twitter" name="twitter" value={formik.values.twitter} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {formik.touched.twitter && formik.errors.twitter && <p className="text-sm text-destructive">{formik.errors.twitter}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input id="linkedin" name="linkedin" value={formik.values.linkedin} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {formik.touched.linkedin && formik.errors.linkedin && <p className="text-sm text-destructive">{formik.errors.linkedin}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};