// ────────────────────────────────────────────────────────────────────────────
// Portfolio service — FastAPI Data Fetching
// ────────────────────────────────────────────────────────────────────────────

import { ActionError } from "@/lib/actions/action-result";
import { internalFetch, internalJson } from "@/lib/api-client/internal-fetch";

import type {
  AboutInfo,
  BlogPost,
  BlogPostFormData,
  ListParams,
  ListResult,
  Project,
  ProjectFormData,
  TechItem,
  TechItemFormData,
  TimelineFormData,
  TimelineItem,
} from "./portfolio.types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function applyPagination<T>(items: T[], params?: ListParams): ListResult<T> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 15;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
  };
}

async function handleApiError(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new ActionError(`API Error (${res.status}): ${text}`);
  }
}

// ─── Projects ───────────────────────────────────────────────────────────────

export async function listProjects(params?: ListParams): Promise<ListResult<Project>> {
  const { json } = await internalJson<Project[]>("/api/v1/projects");
  let items = json;

  if (params?.search) {
    const q = params.search.toLowerCase();
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  return applyPagination(items, params);
}

export async function getProjectById(id: string): Promise<Project> {
  const { res, json } = await internalJson<Project>(`/api/v1/projects/${encodeURIComponent(id)}`);
  await handleApiError(res);
  return json;
}

export async function createProject(data: ProjectFormData): Promise<Project> {
  const id = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || crypto.randomUUID();
  const { res, json } = await internalJson<Project>("/api/v1/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  });
  await handleApiError(res);
  return json;
}

export async function updateProject(id: string, data: Partial<ProjectFormData>): Promise<Project> {
  const { res, json } = await internalJson<Project>(`/api/v1/projects/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  await handleApiError(res);
  return json;
}

export async function deleteProject(id: string): Promise<void> {
  const res = await internalFetch(`/api/v1/projects/${encodeURIComponent(id)}`, { method: "DELETE" });
  await handleApiError(res);
}

// ─── Timeline / Experience ──────────────────────────────────────────────────

export async function listTimeline(params?: ListParams): Promise<ListResult<TimelineItem>> {
  const { json } = await internalJson<TimelineItem[]>("/api/v1/timeline");
  let items = json;

  if (params?.type) {
    items = items.filter((t) => t.type === params.type);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    items = items.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q),
    );
  }

  // Sort by start date descending
  items.sort((a, b) => b.startDate.localeCompare(a.startDate));

  return applyPagination(items, params);
}

export async function getTimelineBySlug(slug: string): Promise<TimelineItem> {
  const { res, json } = await internalJson<TimelineItem>(`/api/v1/timeline/${encodeURIComponent(slug)}`);
  await handleApiError(res);
  return json;
}

export async function createTimelineItem(data: TimelineFormData): Promise<TimelineItem> {
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || crypto.randomUUID();
  const { res, json } = await internalJson<TimelineItem>("/api/v1/timeline", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, ...data }),
  });
  await handleApiError(res);
  return json;
}

export async function updateTimelineItem(slug: string, data: Partial<TimelineFormData>): Promise<TimelineItem> {
  const { res, json } = await internalJson<TimelineItem>(`/api/v1/timeline/${encodeURIComponent(slug)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  await handleApiError(res);
  return json;
}

export async function deleteTimelineItem(slug: string): Promise<void> {
  const res = await internalFetch(`/api/v1/timeline/${encodeURIComponent(slug)}`, { method: "DELETE" });
  await handleApiError(res);
}

// ─── Tech Stack ─────────────────────────────────────────────────────────────

export async function listTechStack(params?: ListParams): Promise<ListResult<TechItem>> {
  const { json } = await internalJson<TechItem[]>("/api/v1/tech-stack");
  let items = json;

  if (params?.type) {
    items = items.filter((t) => t.type === params.type);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    items = items.filter((t) => t.name.toLowerCase().includes(q));
  }

  return applyPagination(items, params);
}

export async function createTechItem(data: TechItemFormData): Promise<TechItem> {
  const { res, json } = await internalJson<TechItem>("/api/v1/tech-stack", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  await handleApiError(res);
  return json;
}

export async function updateTechItem(name: string, data: Partial<TechItemFormData>): Promise<TechItem> {
  const { res, json } = await internalJson<TechItem>(`/api/v1/tech-stack/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  await handleApiError(res);
  return json;
}

export async function deleteTechItem(name: string): Promise<void> {
  const res = await internalFetch(`/api/v1/tech-stack/${encodeURIComponent(name)}`, { method: "DELETE" });
  await handleApiError(res);
}

// ─── About ──────────────────────────────────────────────────────────────────

export async function getAbout(): Promise<AboutInfo> {
  const { res, json } = await internalJson<AboutInfo>("/api/v1/settings/app/about");
  await handleApiError(res);
  return json;
}

export async function updateAbout(data: Partial<AboutInfo>): Promise<AboutInfo> {
  const { res, json } = await internalJson<AboutInfo>("/api/v1/settings/app/about", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  await handleApiError(res);
  return json;
}

// ─── Blog Posts ─────────────────────────────────────────────────────────────

export async function listBlogs(params?: ListParams): Promise<ListResult<BlogPost>> {
  const { json } = await internalJson<BlogPost[]>("/api/v1/blogs");
  let items = json;

  if (params?.search) {
    const q = params.search.toLowerCase();
    items = items.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  // Sort by date descending
  items.sort((a, b) => b.date.localeCompare(a.date));

  return applyPagination(items, params);
}

export async function getBlogBySlug(slug: string): Promise<BlogPost> {
  const { res, json } = await internalJson<BlogPost>(`/api/v1/blogs/${encodeURIComponent(slug)}`);
  await handleApiError(res);
  return json;
}

export async function createBlog(data: BlogPostFormData): Promise<BlogPost> {
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || crypto.randomUUID();
  const { res, json } = await internalJson<BlogPost>("/api/v1/blogs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, ...data }),
  });
  await handleApiError(res);
  return json;
}

export async function updateBlog(slug: string, data: Partial<BlogPostFormData>): Promise<BlogPost> {
  const { res, json } = await internalJson<BlogPost>(`/api/v1/blogs/${encodeURIComponent(slug)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  await handleApiError(res);
  return json;
}

export async function deleteBlog(slug: string): Promise<void> {
  const res = await internalFetch(`/api/v1/blogs/${encodeURIComponent(slug)}`, { method: "DELETE" });
  await handleApiError(res);
}

