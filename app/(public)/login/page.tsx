"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Github, Mail } from "lucide-react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { userLoginFn } from "@/constants/api";
import { useUser } from "@/context/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

// ✅ Form validations
const loginFormValidations = yup.object({
  email: yup.string().email("Invalid email!").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password length should be at least 6")
    .max(16, "Password length should be at most 16")
    .required("Password is required"),
});

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);

  const {login, user} = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard"); // client-side redirect without page reload
    }
  }, [user, router]);

  // ✅ React Query mutation
  const { mutate: userLogin, isPending } = useMutation({
    mutationKey: ["user-login"],
    mutationFn: userLoginFn,
    onSuccess: (data) => {
      toast.success(data.message)
      login(data.data)
      router.push("/dashboard")
    },
    onError: (err) => {
      toast.error(err.message)
    },
  });

  // ✅ Formik setup
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginFormValidations,
    onSubmit: (val) => {
      userLogin({ email: val.email, password: val.password });
      console.log(val)
    },
  });

  const handleOAuth = (provider: string) => {
    alert(`Login with ${provider}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl border border-gray-200 bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Login
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, please sign in
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...formik.getFieldProps("email")}
              />
              {/* {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-500">{formik.errors.email}</p>
              )} */}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...formik.getFieldProps("password")}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
              {/* {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-500">{formik.errors.password}</p>
              )} */}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Separator */}
          <div className="relative my-6">
            <Separator />
            <span className="absolute inset-x-0 -top-3 mx-auto w-fit bg-white px-2 text-sm text-gray-500">
              OR
            </span>
          </div>

          {/* OAuth Buttons */}
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => handleOAuth("Google")}
            >
              <Mail className="w-4 h-4" />
              Continue with Google
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => handleOAuth("GitHub")}
            >
              <Github className="w-4 h-4" />
              Continue with GitHub
            </Button>
          </div>
        </CardContent>

        <CardFooter className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}