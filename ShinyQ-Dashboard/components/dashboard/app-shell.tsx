"use client";

import { useEffect, useState } from "react";

import { usePathname } from "next/navigation";

import { Menu, Search, X } from "lucide-react";

import { NotificationDropdown } from "@/components/dashboard/notification-dropdown";
import { AppSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/contexts/dashboard-context";
import { resolveMenuGroupsForSession } from "@/lib/nav/resolve-menu";
import { staticMenuGroups } from "@/lib/nav/static-menu";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, refresh } = useDashboard();
  const menuGroups = resolveMenuGroupsForSession(staticMenuGroups, user);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  async function handleSignOut() {
    await fetch("/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    await refresh();
    window.location.href = "/login";
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center gap-3 border-b border-border bg-card px-4 py-3 shadow-sm lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 text-foreground"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
        <div className="flex size-8 items-center justify-center rounded-lg bg-brand-500 text-xs font-bold text-white">
          AI
        </div>
        <span className="flex-1 text-sm font-semibold">AI-ME Dashboard</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 text-muted-foreground"
        >
          <Search className="size-4" />
        </Button>
        <NotificationDropdown />
      </div>

      {/* Mobile backdrop */}
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      {/* Desktop sidebar */}
      <aside className="hidden h-screen shrink-0 overflow-hidden lg:flex">
        <AppSidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          groups={menuGroups}
          user={user}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <AppSidebar
          collapsed={false}
          onToggleCollapse={() => setMobileOpen(false)}
          groups={menuGroups}
          user={user}
          isMobile
          onMobileClose={() => setMobileOpen(false)}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Main content */}
      <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-none pt-14 lg:pt-0">
        {/* Desktop top header */}
        <header className="sticky top-0 z-30 hidden h-14 shrink-0 items-center justify-end border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:flex">
          <NotificationDropdown />
        </header>

        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
