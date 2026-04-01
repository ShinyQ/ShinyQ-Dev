import { notFound } from "next/navigation";

import { BlogEditorForm } from "@/features/portfolio/blog/blog-editor-form";
import { getBlogAction } from "@/lib/actions/portfolio/portfolio.actions";

export const metadata = {
  title: "Edit Post | Portfolio CMS",
};

type Params = {
  slug: string;
};

export default async function EditBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getBlogAction(slug);

  if (!result.ok) {
    notFound();
  }

  return <BlogEditorForm blog={result.data} />;
}
