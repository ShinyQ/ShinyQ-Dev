import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/get-session";

import { AuthenticatedShell } from "./authenticated-shell";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/login");

  return <AuthenticatedShell user={user}>{children}</AuthenticatedShell>;
}
