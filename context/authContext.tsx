"use client";

import { getMeFn } from "@/constants/api";
import api from "@/constants/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

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
  getMe: any;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { data: getMe, isLoading } = useQuery({
    queryKey: ["me", user],
    queryFn: getMeFn,
  });

  useEffect(() => {
    const publicRoutes = [
      "/",
      "/login",
      "/register",
      "/forgot-password",
      "/verify-otp",
    ];

    if (isLoading) {
      setLoading(true);
      return;
    }

    if (!user) {
      if (getMe?.data) {
        setUser(getMe.data);
      } else {
        if (!publicRoutes.includes(pathname)) {
          router.push("/");
        }
      }
    }
    setLoading(false);
  }, [getMe, isLoading, pathname, router, user]);

  // Set user after successful login
  const login = (userData: User) => {
    setUser(userData);
    queryClient.setQueryData(["me"], { data: userData });
  };

  // Logout and clear state
  const logout = async () => {
    try {
      await api.post("/auth/users/logout");
      queryClient.removeQueries({ queryKey: ["me"] });
      setUser(null);
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex justify-center items-center">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <UserContext.Provider
      value={{ user, setUser, login, logout, getMe: user }}
    >
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
