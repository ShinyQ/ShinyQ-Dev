"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Loader2 } from "lucide-react";

import type { SessionUser } from "@/types/session";

type DashboardState = {
  user: SessionUser | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const DashboardContext = createContext<DashboardState | undefined>(undefined);

export function DashboardProvider({
  initialUser,
  children,
}: {
  initialUser?: SessionUser;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<SessionUser | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState(!initialUser);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/auth/me", { credentials: "include" });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = (await res.json()) as { user: SessionUser };
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Skip initial fetch when server already provided the user
    if (initialUser) return;

    let cancelled = false;
    (async () => {
      setIsLoading(true);
      await refresh();
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh, initialUser]);

  const value = useMemo<DashboardState>(
    () => ({ user, isLoading, refresh }),
    [user, isLoading, refresh],
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return ctx;
}
