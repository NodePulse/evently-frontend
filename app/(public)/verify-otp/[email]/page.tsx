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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { forgotPasswordFn, verifyOtpFn } from "@/constants/api";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import * as yup from "yup";

export default function VerifyOtp() {
  const router = useRouter();
  const params = useParams();
  const email = params.email ? atob(decodeURIComponent(params.email as string)) : null;

  const { mutate: verifyOtp, isPending } = useMutation({
    mutationKey: ["verify-otp"],
    mutationFn: verifyOtpFn,
    onSuccess: (data) => {
      toast.success(data.message);
      router.push(`/reset-password?token=${data.data.token}`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const { mutate: resendOtp, isPending: isResending } = useMutation({
    mutationKey: ["resend-otp"],
    mutationFn: forgotPasswordFn,
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: yup.object({
      otp: yup.string().required("OTP is required").length(6, "OTP must be 6 digits"),
    }),
    onSubmit: (values) => {
      if (email) {
        verifyOtp({ email, otp: values.otp });
      }
    },
  });

  const handleResendOtp = () => {
    if (email) {
      resendOtp({ email });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Verify OTP</CardTitle>
          <CardDescription>Enter the OTP sent to {email}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2 justify-center">
                <InputOTP
                  maxLength={6}
                  value={formik.values.otp}
                  onChange={(value) => formik.setFieldValue("otp", value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                {formik.touched.otp && formik.errors.otp && (
                  <p className="text-red-500 text-xs text-center">{formik.errors.otp}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/login" className="text-sm underline">
            Back to Login
          </Link>
          <Button
            variant="link"
            className="text-sm"
            onClick={handleResendOtp}
            disabled={isResending}
          >
            {isResending ? "Sending..." : "Resend OTP"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}