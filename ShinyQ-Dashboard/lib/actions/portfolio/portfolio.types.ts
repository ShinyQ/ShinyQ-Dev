// ────────────────────────────────────────────────────────────────────────────
// Portfolio entity types — mirrors portfolio site data shapes.
// ────────────────────────────────────────────────────────────────────────────

export interface GalleryImage {
  id: string;
  project_id: string;
  image_key: string;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  tags: string[];
  role: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  docUrl?: string;
  docPpt?: string;
  galleries: GalleryImage[];
}

export type ProjectFormData = Omit<Project, "id" | "galleries">;

// ────────────────────────────────────────────────────────────────────────────

export type TimelineType =
  | "Full-Time"
  | "Part-Time"
  | "Education"
  | "Certification"
  | "Competition";

export interface TimelineItem {
  slug: string;
  startDate: string;
  endDate: string;
  title: string;
  subtitle: string;
  caption?: string;
  description?: string[];
  tools?: string[];
  logo?: string;
  type: TimelineType;
}

export type TimelineFormData = Omit<TimelineItem, "slug">;

// ────────────────────────────────────────────────────────────────────────────

export type TechStackType = "backend" | "frontend" | "other";

export interface TechItem {
  name: string;
  icon: string;
  type?: TechStackType;
  site?: string;
}

export type TechItemFormData = TechItem; // name acts as ID

// ────────────────────────────────────────────────────────────────────────────

export interface AboutInfo {
  intro: string;
  philosophy: string[];
  workingStyle: string[];
  favoriteTech: string[];
  quote?: string;
  profilePhoto?: string;
}

// ────────────────────────────────────────────────────────────────────────────

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  coverImage?: string;
  excerpt?: string;
  tags: string[];
  readingTime?: string;
  author: string;
  category: string;
  featured: boolean;
  content: string;
}

export type BlogPostFormData = Omit<BlogPost, "slug">;

// ────────────────────────────────────────────────────────────────────────────
// Shared pagination / list types
// ────────────────────────────────────────────────────────────────────────────

export interface ListParams {
  page?: number;
  pageSize?: number;
  type?: string;
  search?: string;
}

export interface ListResult<T> {
  items: T[];
  total: number;
}
