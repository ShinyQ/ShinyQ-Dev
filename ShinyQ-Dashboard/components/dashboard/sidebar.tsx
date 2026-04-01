"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogOut, PanelLeftClose, PanelRightClose } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { NavGroup } from "@/types/nav";

export type AppSidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  groups: NavGroup[];
  user?: { name?: string; email?: string } | null;
  isMobile?: boolean;
  onMobileClose?: () => void;
  onSignOut?: () => void;
};

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function UserAvatar({ name }: { name?: string }) {
  const initials = (name ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
      {initials}
    </div>
  );
}

export function AppSidebar({
  collapsed,
  onToggleCollapse,
  groups,
  user,
  isMobile = false,
  onMobileClose,
  onSignOut,
}: AppSidebarProps) {
  const pathname = usePathname();
  const railCollapsed = isMobile ? false : collapsed;

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex h-screen min-h-0 flex-col bg-sidebar transition-all duration-300",
          railCollapsed ? "w-16" : "w-[260px]",
        )}
      >
        {/* Logo header */}
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-5",
            railCollapsed && "justify-center px-2",
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white shadow-lg shadow-brand-500/25">
            AI
          </div>
          {!railCollapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                AI-ME Dashboard
              </p>
              <p className="truncate text-[11px] text-sidebar-muted">
                Template v1.0
              </p>
            </div>
          ) : null}
          {!isMobile && !railCollapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-sidebar-muted hover:bg-sidebar-accent hover:text-white"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          ) : null}
          {!isMobile && railCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-sidebar-muted hover:bg-sidebar-accent hover:text-white"
                  onClick={onToggleCollapse}
                  aria-label="Expand sidebar"
                >
                  <PanelRightClose className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          ) : null}
        </div>

        {/* Divider */}
        <div className="mx-3 border-t border-sidebar-border" />

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group, groupIdx) => (
            <div key={group.label} className={cn(groupIdx > 0 && "mt-5")}>
              {!railCollapsed ? (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">
                  {group.label}
                </p>
              ) : (
                groupIdx > 0 && (
                  <div className="mx-1 mb-2 border-t border-sidebar-border" />
                )
              )}
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isNavActive(pathname, item.href);
                  const enabled = item.enabled !== false;

                  const linkBody = (
                    <>
                      <Icon
                        className={cn(
                          "size-[18px] shrink-0 transition-colors",
                          active
                            ? "text-brand-400"
                            : "text-sidebar-muted group-hover:text-white",
                        )}
                      />
                      {!railCollapsed ? (
                        <span className="truncate">{item.label}</span>
                      ) : null}
                    </>
                  );

                  if (!enabled) {
                    return (
                      <li key={item.id}>
                        <span
                          className={cn(
                            "group flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-muted/40",
                            railCollapsed && "justify-center px-2",
                          )}
                          title={railCollapsed ? item.label : undefined}
                        >
                          {linkBody}
                        </span>
                      </li>
                    );
                  }

                  const inner = (
                    <Link
                      href={item.href}
                      onClick={isMobile ? onMobileClose : undefined}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                        active
                          ? "bg-sidebar-accent font-medium text-white shadow-sm"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white",
                        railCollapsed && "justify-center px-2",
                      )}
                      title={railCollapsed ? item.label : undefined}
                    >
                      {linkBody}
                    </Link>
                  );

                  if (railCollapsed) {
                    return (
                      <li key={item.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>{inner}</TooltipTrigger>
                          <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                      </li>
                    );
                  }

                  return <li key={item.id}>{inner}</li>;
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="mx-3 border-t border-sidebar-border" />
        <div
          className={cn(
            "p-3",
            railCollapsed && "flex flex-col items-center px-1",
          )}
        >
          {!railCollapsed && user ? (
            <div className="flex items-center gap-2 rounded-lg px-2 py-2">
              <UserAvatar name={user.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {user.name ?? "User"}
                </p>
                {user.email ? (
                  <p className="truncate text-[11px] text-sidebar-muted">
                    {user.email}
                  </p>
                ) : null}
              </div>
              <div className="mx-1 h-5 w-px bg-sidebar-border" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-sidebar-muted hover:bg-sidebar-accent hover:text-white"
                    onClick={onSignOut}
                  >
                    <LogOut className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Sign out</TooltipContent>
              </Tooltip>
            </div>
          ) : null}
          {railCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 text-sidebar-muted hover:bg-sidebar-accent hover:text-white"
                  onClick={onSignOut}
                >
                  <LogOut className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </div>
    </TooltipProvider>
  );
}
