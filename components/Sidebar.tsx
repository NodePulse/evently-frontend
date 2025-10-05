'use client';

import { Home, Calendar, Plus, User, LogOut, Compass } from "lucide-react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const Sidebar = ({ className }: { className?: string }) => {
  const pathname = usePathname();

  const navLinks = [
    {
      title: "Core Navigation",
      links: [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/explore", label: "Explore Events", icon: Compass },
      ],
    },
    {
      title: "Event Management",
      links: [
        { href: "/createEvent", label: "Create New Event", icon: Plus },
        { href: "/my-events", label: "My Events", icon: Calendar },
        { href: "/attending-events", label: "Events I'm Attending", icon: Calendar },
      ],
    },
    {
      title: "User Account",
      links: [
        { href: "/profile", label: "Profile Settings", icon: User },
        { href: "/logout", label: "Logout", icon: LogOut },
      ],
    },
  ];

  return (
    <div className={cn("border-r bg-muted/40", className)}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-lg font-bold">Evently</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navLinks.map((section) => (
              <div key={section.title}>
                <h3 className="my-4 px-4 text-lg font-semibold tracking-tight">
                  {section.title}
                </h3>
                {section.links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        isActive && "bg-primary/10 text-primary"
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
