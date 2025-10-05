"use client";

import { getMeFn } from "@/constants/api";
import api from "@/constants/axios";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  image: string;
  bio: string;
  location: string;
  username: string;
  gender: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  getMe: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter()

  const { mutate: getMe } = useMutation({
    mutationFn: getMeFn,
    onSuccess: (data) => {
      setUser(data)
      setLoading(false)
    },
    onError: () => {
      setUser(null)
      setLoading(false)
    }
  })

  // Run once when provider mounts
  useEffect(() => {
    getMe();
  }, []);

  useEffect(() => {
    const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/verify-otp"];
    const path = window.location.pathname;
    if (!loading && !user && !publicRoutes.includes(path)) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Set user after successful login
  const login = (userData: User) => {
    setUser(userData)
  };

  // Logout and clear state
  const logout = async () => {
    try {
      await api.post("/user/auth/logout");
      setUser(null);
      router.push("/login")
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex justify-center items-center">
        <h2>Loading...</h2>
      </div>
    )
  }

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, getMe }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};