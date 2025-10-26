"use client";

import { Menu, Bell, X, ChevronRight } from "lucide-react"; // Make sure to import the X icon
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";

// Define the props the Header will accept
interface HeaderProps {
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
}

export const Header = ({ onSidebarToggle, sidebarOpen }: HeaderProps) => {
  // A flag to show the notification dot. You can wire this up to your app's state.
  const hasNewNotification = true;
  const pathname = usePathname();
  console.log(pathname);

  const showTitle = [
    { title: "Dashboard", path: "/dashboard" },
    { title: "Events", path: "/explore" },
    { title: "Create New Event", path: "/createEvent" },
    { title: "My Events", path: "/my-events" },
    { title: "Events I'm Attending", path: "/attending-events" },
    { title: "Profile Settings", path: "/profile" },
    { title: "Logout", path: "/logout" },
  ]

  const generateTitle = (path: string) => {
    // First, try to find an exact match for the whole path.
    // This is the most efficient way to handle static routes like "/dashboard" or "/profile".
    const exactMatch = showTitle.find(item => item.path === path);
    if (exactMatch) {
      return exactMatch.title;
    }

    const pathParts = path.split('/').filter(Boolean); // e.g., ['explore', 'some-event-id']

    // Handle special dynamic paths like /explore/:id
    if (pathParts[0] === 'events' && pathParts.length > 1) {
      return (
        <div className="flex items-center gap-1 text-2xl">
          <Link href="/explore" className="text-muted-foreground hover:text-foreground">
            Events
          </Link>
          <ChevronRight className="h-5 w-5 text-muted-foreground font-semibold" />
          {
            showTitle.find(item => item.path === `/events/${pathParts[1]}`)?.title || "Event Details"
          }
        </div>
      );
    }

    // Handle the root path, which defaults to Dashboard
    if (pathParts.length === 0) {
        return "Dashboard";
    }

    // Fallback for any other multi-part paths (e.g., /settings/security)
    return pathParts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '))
      .join(' > ');
  };

  return (
    <header className="flex h-14 items-center justify-between bg-gradient-to-b from-background to-transparent px-4 sm:px-6">
      {/* This button is now only visible on mobile screens.
        It switches between the Menu and X icon.
      */}
      <Button
        onClick={onSidebarToggle}
        variant="ghost"
        size="icon"
        aria-label="Toggle sidebar"
        className="md:hidden" // Hides the toggle on desktop where the sidebar is always visible
      >
        <Menu className="h-6 w-6" />
      </Button>

      {pathname && <div className="hidden md:block text-2xl font-semibold px-2">{generateTitle(pathname)}</div>}

      {/* An empty div to correctly align the notification icon to the right on desktop */}
      <div className="hidden md:block" />

      {/* Notification Icon */}
      <div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="View notifications"
          className="relative"
        >
          <Bell className="h-6 w-6" />
          {hasNewNotification && (
            // This is the red "new notification" dot with a pulsing animation
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </Button>
      </div>
    </header>
  );
};
