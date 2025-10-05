"use client";

import React, { useState } from "react";
import { useUser } from "@/context/authContext";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const Header = () => {
  const { user, logout } = useUser();
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="backdrop-blur-lg bg-gray-900/80 text-white px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-50">
      {/* Logo */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="text-2xl font-extrabold tracking-wide cursor-pointer"
      >
        Evently
      </motion.div>

      {/* Navigation */}
      <nav className="space-x-6 text-lg hidden md:flex">
        {["Home", "About", "Dashboard"].map((link) => (
          <a
            key={link}
            href={link === "Home" ? "/" : `/${link.toLowerCase()}`}
            className="relative group"
          >
            <span className="hover:text-blue-400 transition-colors">
              {link}
            </span>
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-400 transition-all group-hover:w-full"></span>
          </a>
        ))}
      </nav>

      {/* User Section */}
      <div>
        {user ? (
          <Popover>
            <PopoverTrigger asChild>
              <Avatar className="cursor-pointer ring-2 ring-blue-500 hover:ring-blue-400 transition">
                <AvatarFallback className="bg-yellow-500">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 bg-gray-800 text-white rounded-xl shadow-lg">
              <div className="flex flex-col gap-2">
                {/* Profile Dialog */}
                <Dialog open={isProfileOpen} onOpenChange={setProfileOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="justify-start hover:bg-blue-500 hover:text-white rounded-lg"
                    >
                      Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Your Profile</DialogTitle>
                      <DialogDescription>
                        Here are your personal details.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-2">
                      <p>
                        <span className="font-semibold">Name:</span>{" "}
                        {user.name || "Not Provided"}
                      </p>
                      <p>
                        <span className="font-semibold">Email:</span>{" "}
                        {user.email || "Not Provided"}
                      </p>
                      <p>
                        <span className="font-semibold">Role:</span>{" "}
                        {user.role || "User"}
                      </p>
                    </div>
                    <DialogClose asChild>
                      <Button variant="outline" onClick={() => setProfileOpen(false)}>Close</Button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>

                {/* Settings (Change Password) Dialog */}
                <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="justify-start hover:bg-blue-500 hover:text-white rounded-lg"
                    >
                      Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Update your account password here.
                      </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          type="password"
                          id="currentPassword"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          type="password"
                          id="newPassword"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <Input
                          type="password"
                          id="confirmPassword"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-blue-500">
                        Update Password
                      </Button>
                    </form>
                    <DialogClose asChild>
                      <Button variant="outline" onClick={() => setSettingsOpen(false)}>Close</Button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>

                {/* Logout Button */}
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="justify-start hover:bg-red-500 hover:text-white rounded-lg"
                >
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <a
            href="/login"
            className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
          >
            Login
          </a>
        )}
      </div>
    </header>
  );
};

export default Header;
