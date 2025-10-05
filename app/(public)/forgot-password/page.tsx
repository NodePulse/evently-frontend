"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordFn } from "@/constants/api";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import * as yup from "yup";

export default function ForgotPassword() {
    const router = useRouter()

  // ✅ React Query mutation
  const { mutate: forgotPassword, isPending } = useMutation({
    mutationKey: ["forgot-password"],
    mutationFn: forgotPasswordFn,
    onSuccess: (data, variables) => {
      toast.success(data.message)
      router.push(`/verify-otp/${encodeURIComponent(btoa(variables.email))}`)
    //   login(data.data)
    },
    onError: (err) => {
      toast.error(err.message)
    },
  });

  // ✅ Formik setup
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: yup.string().email("Invalid email!").required("Email is required"),
    onSubmit: (val) => {
      forgotPassword({ email: val.email });
      console.log(val)
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Forgot password for:", formik.values.email);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={formik.values.email}
                  onChange={formik.handleChange}
                />
              </div>
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" className="text-sm underline">
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
