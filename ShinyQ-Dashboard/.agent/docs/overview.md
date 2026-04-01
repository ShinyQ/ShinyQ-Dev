# Overview — AI-ME Template Dashboard

## Application Name

**AI-ME Template Dashboard** — Fullstack Starter for AI Applications

## Purpose

The **AI-ME Template Dashboard** is a modern, full-stack starter template designed to accelerate the development of AI-powered platforms. It provides a robust foundation with a consistent UX for operators and admins, versioned APIs, and patterns for long-running and streaming AI workloads.

## Key Features

- **Product-Ready Dashboard Shell** — Authenticated layout with a responsive sidebar (including mobile drawer), consistent tokens, and shared UI primitives suited for AI operations (jobs, logs, tables, settings).
- **Built-in Backend Scaffold** — A FastAPI service layout (`services/api`) with `/api/v1` versioning, shared error handling, and pagination contracts.
- **BFF (Backend-for-Frontend) Pattern** — Next.js App Router acting as a BFF to ensure credentials and backend URLs never ship to the browser.
- **Typed Server Actions** — Standardized `ActionResult<T>` pattern for mutations, optional RBAC support, and secure server-to-server integration.
- **AI Workload Patterns** — Implementation patterns for SSE (Server-Sent Events) with polling fallbacks for long-running jobs and streaming inference.
- **Company Brand Defaults** — A pre-configured design system with a full brand color scale (`#027DC7`) and semantic status colors.

## Business Goal

The primary objective of this template is to give engineering teams everything they need to **build, manage, and scale** enterprise-grade AI applications quickly, while maintaining high standards for security, performance, and user experience.

## Main Frameworks

- **Frontend:** [Next.js 16](https://nextjs.org/) (App Router)
- **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+)
- **Runtime:** [Bun](https://bun.sh/) (v1.2+) for local development
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) tokens

## Further Reading

- [**Architecture**](architecture.md) — System flow and BFF explanation.
- [**Development**](development.md) — Local setup guide.
- [**Backend / FastAPI**](backend.md) — API contract and Python tooling.
- [**Server Actions**](server-actions.md) — `ActionResult` pattern for UI mutations.
- [**Authentication**](authentication.md) — Session interface and RBAC mapping.
- [**Brand Guidelines**](brand-guidelines.md) — Design tokens, Tailwind palettes, and typography.
