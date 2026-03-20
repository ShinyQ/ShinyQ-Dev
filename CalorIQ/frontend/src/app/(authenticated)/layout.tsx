import { UserButton } from "@clerk/nextjs";
import { Utensils } from "lucide-react";
import { BottomNav } from "src/components/layout/bottom-nav";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-13 max-w-lg items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500">
              <Utensils className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-900">CalorIQ</span>
          </div>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-7 w-7",
              },
            }}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pb-24 pt-5">
        {children}
      </main>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
