"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Header } from "@/components/Header"; // Import the shared Header

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] overflow-hidden">
      {/* Sidebar for larger screens */}
      <div className="hidden border-r bg-background md:block">
        <Sidebar />
      </div>

      {/* Sidebar drawer for small screens */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-background transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Overlay when sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div className="flex flex-col h-screen overflow-hidden bg-muted/40">
        {/* Fixed Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b md:left-[220px] lg:left-[280px]">
          <Header
            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />
        </header>

        {/* Main content with padding to avoid header overlap */}
        <main className="flex-1 overflow-y-auto px-4 pt-[72px] md:pt-[80px]">
          {children}
        </main>
      </div>
    </div>
  );
}