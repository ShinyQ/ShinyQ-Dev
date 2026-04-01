import {
  Briefcase,
  FileText,
  FolderKanban,
  Layers,
  User,
} from "lucide-react";

import type { NavGroup } from "@/types/nav";

export const staticMenuGroups: NavGroup[] = [
  {
    label: "Portfolio",
    items: [
      { id: "portfolio-projects", href: "/portfolio/projects", label: "Projects", icon: FolderKanban },
      { id: "portfolio-experience", href: "/portfolio/experience", label: "Experience", icon: Briefcase },
      { id: "portfolio-tech-stack", href: "/portfolio/tech-stack", label: "Tech Stack", icon: Layers },
      { id: "portfolio-about", href: "/portfolio/about", label: "About", icon: User },
      { id: "portfolio-blog", href: "/portfolio/blog", label: "Blog", icon: FileText },
    ],
  },
];
