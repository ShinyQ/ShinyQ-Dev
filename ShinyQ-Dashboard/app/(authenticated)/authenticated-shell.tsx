"use client";

import { AppShell } from "@/components/dashboard/app-shell";
import { DashboardProvider } from "@/contexts/dashboard-context";
import type { SessionUser } from "@/types/session";

export function AuthenticatedShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider initialUser={user}>
      <AppShell>{children}</AppShell>
    </DashboardProvider>
  );
}
