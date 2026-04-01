"use server";

import { withActionResult } from "@/lib/actions/middleware.actions";

import * as svc from "./portfolio.service";
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

// Re-export types for client consumption
export type {
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

// ─── Project Actions ────────────────────────────────────────────────────────

export async function listProjectsAction(params?: ListParams) {
  return withActionResult<ListResult<Project>>(() => svc.listProjects(params));
}

export async function getProjectAction(id: string) {
  return withActionResult<Project>(() => svc.getProjectById(id));
}

export async function createProjectAction(data: ProjectFormData) {
  return withActionResult<Project>(() => svc.createProject(data));
}

export async function updateProjectAction(id: string, data: Partial<ProjectFormData>) {
  return withActionResult<Project>(() => svc.updateProject(id, data));
}

export async function deleteProjectAction(id: string) {
  return withActionResult<void>(() => svc.deleteProject(id));
}

// ─── Timeline Actions ───────────────────────────────────────────────────────

export async function listTimelineAction(params?: ListParams) {
  return withActionResult<ListResult<TimelineItem>>(() => svc.listTimeline(params));
}

export async function getTimelineAction(slug: string) {
  return withActionResult<TimelineItem>(() => svc.getTimelineBySlug(slug));
}

export async function createTimelineAction(data: TimelineFormData) {
  return withActionResult<TimelineItem>(() => svc.createTimelineItem(data));
}

export async function updateTimelineAction(slug: string, data: Partial<TimelineFormData>) {
  return withActionResult<TimelineItem>(() => svc.updateTimelineItem(slug, data));
}

export async function deleteTimelineAction(slug: string) {
  return withActionResult<void>(() => svc.deleteTimelineItem(slug));
}

// ─── Tech Stack Actions ─────────────────────────────────────────────────────

export async function listTechStackAction(params?: ListParams) {
  return withActionResult<ListResult<TechItem>>(() => svc.listTechStack(params));
}

export async function createTechItemAction(data: TechItemFormData) {
  return withActionResult<TechItem>(() => svc.createTechItem(data));
}

export async function updateTechItemAction(name: string, data: Partial<TechItemFormData>) {
  return withActionResult<TechItem>(() => svc.updateTechItem(name, data));
}

export async function deleteTechItemAction(name: string) {
  return withActionResult<void>(() => svc.deleteTechItem(name));
}

// ─── About Actions ──────────────────────────────────────────────────────────

export async function getAboutAction() {
  return withActionResult<AboutInfo>(() => svc.getAbout());
}

export async function updateAboutAction(data: Partial<AboutInfo>) {
  return withActionResult<AboutInfo>(() => svc.updateAbout(data));
}

// ─── Blog Actions ───────────────────────────────────────────────────────────

export async function listBlogsAction(params?: ListParams) {
  return withActionResult<ListResult<BlogPost>>(() => svc.listBlogs(params));
}

export async function getBlogAction(slug: string) {
  return withActionResult<BlogPost>(() => svc.getBlogBySlug(slug));
}

export async function createBlogAction(data: BlogPostFormData) {
  return withActionResult<BlogPost>(() => svc.createBlog(data));
}

export async function updateBlogAction(slug: string, data: Partial<BlogPostFormData>) {
  return withActionResult<BlogPost>(() => svc.updateBlog(slug, data));
}

export async function deleteBlogAction(slug: string) {
  return withActionResult<void>(() => svc.deleteBlog(slug));
}

