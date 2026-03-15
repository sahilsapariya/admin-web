"use client";

import { useAuth } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email
      ? user.email.slice(0, 2).toUpperCase()
      : "?";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex-1 md:flex-none" />

      <div className="flex items-center gap-3">
        {user && (
          <>
            <div className="flex items-center gap-2 sm:gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user.profile_picture_url}
                  alt={user.name || user.email}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">
                {user.name || user.email}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
