'use client';

import React, { useState } from "react";
import { useUser } from "@/context/authContext";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { Separator } from "./ui/separator";
import Link from "next/link";

const PrivateHeader = () => {
  const { user, logout } = useUser();
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 lg:px-6 lg:pt-6">
        <Sheet>
            <SheetTrigger asChild>
            <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
            >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
            </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
                <Sidebar />
            </SheetContent>
        </Sheet>

      <div className="flex-1"></div>

      {/* User Section */}
      <div>
        {user ? (
          <Popover>
            <PopoverTrigger asChild>
              <Avatar className="cursor-pointer h-9 w-9 ring-2 ring-primary/50 hover:ring-primary transition">
                <AvatarFallback className="bg-primary/20">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="flex flex-col gap-1">
                <Dialog open={isProfileOpen} onOpenChange={setProfileOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="justify-start"
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

                <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="justify-start"
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
                      <Button type="submit" className="w-full">
                        Update Password
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Separator className="my-1" />

                <Button
                  variant="ghost"
                  onClick={logout}
                  className="justify-start text-red-500 hover:text-red-600"
                >
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Button asChild>
            <Link href="/login">
                Login
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default PrivateHeader;
