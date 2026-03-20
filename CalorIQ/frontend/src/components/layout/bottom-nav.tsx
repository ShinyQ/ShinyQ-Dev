"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, BarChart3, User } from "lucide-react";
import { cn } from "src/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/log", label: "Log", icon: PlusCircle },
  { href: "/summary", label: "Summary", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[60px] max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-orange-600"
                  : "text-zinc-400 active:text-zinc-600"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  isActive && "bg-orange-50"
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px]",
                    isActive ? "text-orange-600" : "text-zinc-400"
                  )}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for home indicator */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}
