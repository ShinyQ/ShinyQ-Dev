"use client";

import { useEffect, useRef, useState } from "react";

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  Rocket,
  ShieldAlert,
  X,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotificationType = "info" | "warning" | "success" | "error";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: "n1",
    type: "warning",
    title: "Rate Limit Warning",
    description: "GPT-4o usage is approaching the daily rate limit (92% used).",
    time: "5 min ago",
    read: false,
  },
  {
    id: "n2",
    type: "success",
    title: "Model Deployed",
    description:
      "Claude Sonnet 4 endpoint has been successfully deployed to production.",
    time: "22 min ago",
    read: false,
  },
  {
    id: "n3",
    type: "error",
    title: "High Error Rate Detected",
    description: "The /v1/summarize endpoint error rate exceeded 5% threshold.",
    time: "1 hr ago",
    read: false,
  },
  {
    id: "n4",
    type: "info",
    title: "Cost Threshold Alert",
    description: "Monthly spending has reached $1,500 of the $2,000 budget.",
    time: "2 hr ago",
    read: true,
  },
  {
    id: "n5",
    type: "success",
    title: "Batch Job Completed",
    description:
      "Embedding generation for 12,400 documents completed successfully.",
    time: "3 hr ago",
    read: true,
  },
  {
    id: "n6",
    type: "info",
    title: "New Model Available",
    description: "Gemini 2.5 Flash is now available in your model registry.",
    time: "5 hr ago",
    read: true,
  },
];

const typeConfig: Record<
  NotificationType,
  { icon: typeof Info; iconClass: string; bgClass: string }
> = {
  info: {
    icon: Info,
    iconClass: "text-blue-500",
    bgClass: "bg-blue-50",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    bgClass: "bg-amber-50",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-50",
  },
  error: {
    icon: XCircle,
    iconClass: "text-red-500",
    bgClass: "bg-red-50",
  },
};

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="relative size-9 text-muted-foreground"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[380px] overflow-hidden rounded-xl border border-border bg-card shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={markAllRead}
              >
                Mark all read
              </Button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Rocket className="mb-2 size-8 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">
                  All clear!
                </p>
                <p className="text-xs text-muted-foreground/70">
                  No notifications
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = typeConfig[n.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    className={cn(
                      "group flex gap-3 border-b border-border/50 px-4 py-3 transition-colors last:border-0",
                      !n.read ? "bg-primary/[0.03]" : "hover:bg-muted/30",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full",
                        cfg.bgClass,
                      )}
                    >
                      <Icon className={cn("size-4", cfg.iconClass)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm",
                            !n.read ? "font-semibold" : "font-medium",
                          )}
                        >
                          {n.title}
                        </p>
                        <button
                          onClick={() => dismissNotification(n.id)}
                          className="shrink-0 rounded p-0.5 text-muted-foreground/50 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                          aria-label="Dismiss"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {n.description}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground/70">
                          {n.time}
                        </span>
                        {!n.read && (
                          <span className="size-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-border px-4 py-2.5 text-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-full text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
