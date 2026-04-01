"use client";

import { PageContainer } from "@/components/dashboard/page-container";
import { PageHeader } from "@/components/dashboard/page-header";
import { AboutEditor } from "@/features/portfolio/about/about-editor";

export default function AboutPage() {
  return (
    <PageContainer>
      <PageHeader
        title="About"
        description="Manage your personal profile, philosophy, working style, and favorite technologies."
      />

      <AboutEditor />
    </PageContainer>
  );
}
