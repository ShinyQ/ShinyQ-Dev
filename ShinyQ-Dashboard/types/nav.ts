import type { LucideIcon } from "lucide-react";

export type NavAccessRule = {
  scope: string;
  role: string;
};

export type NavItem = {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  enabled?: boolean;
  requiredAccess?: NavAccessRule[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};
