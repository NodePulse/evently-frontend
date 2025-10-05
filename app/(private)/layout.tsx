"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] overflow-hidden">
      {/* Sidebar for larger screens */}
      <div className="hidden md:block h-screen overflow-y-auto bg-background border-r">
        <Sidebar />
      </div>

      {/* Sidebar drawer for small screens */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-background transform transition-transform duration-300 ease-in-out md:hidden border-r ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      {/* Overlay when sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Top bar for mobile */}
        <header className="flex items-center justify-between p-4 border-b bg-background md:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 lg:pt-0 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
