"use client";

import { useUser } from "@/context/authContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const { user } = useUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Welcome to Evently</h1>
      {user ? (
        <div>
          <p className="text-lg mb-4">You are logged in as {user.name}.</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-lg mb-4">You are not logged in.</p>
          <div className="flex gap-4">
            <Link href="/login">
              <Button>Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary">Register</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}