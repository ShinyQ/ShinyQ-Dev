"use client";

import { useEffect, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { ArrowLeft, Save, Upload } from "lucide-react";

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  createBlogAction,
  updateBlogAction,
} from "@/lib/actions/portfolio/portfolio.actions";
import type { BlogPost, BlogPostFormData } from "@/lib/actions/portfolio/portfolio.types";
import { generateUploadUrlAction } from "@/lib/actions/storage/upload.actions";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type Props = {
  blog?: BlogPost | null;
};

const emptyForm: BlogPostFormData = {
  title: "",
  date: new Date().toISOString().split("T")[0],
  coverImage: "",
  excerpt: "",
  tags: [],
  readingTime: "",
  author: "",
  category: "",
  featured: false,
  content: "",
};

export function BlogEditorForm({ blog }: Props) {
  const router = useRouter();
  const isEdit = !!blog;
  const [form, setForm] = useState<BlogPostFormData>(emptyForm);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (blog) {
      setForm({
        ...emptyForm,
        title: blog.title,
        date: blog.date,
        coverImage: blog.coverImage,
        excerpt: blog.excerpt,
        tags: blog.tags,
        readingTime: blog.readingTime,
        author: blog.author,
        category: blog.category,
        featured: blog.featured,
        content: blog.content,
      });
    }
  }, [blog]);

  function set<K extends keyof BlogPostFormData>(
    key: K,
    val: BlogPostFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function handleSave() {
    if (!form.title.trim() || !form.content.trim()) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Title and content are required.",
      });
      return;
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateBlogAction(blog!.slug, form)
        : await createBlogAction(form);

      if (result.ok) {
        toast({
          title: isEdit ? "Post updated" : "Post created",
          description: `"${result.data.title}" saved successfully.`,
          variant: "success",
        });
        router.push("/portfolio/blog");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error.message,
        });
      }
    });
  }

  async function handleImageUpload(file: File): Promise<string | null> {
    toast({ title: "Uploading image..." });
    try {
      const result = await generateUploadUrlAction(file.name, file.type, "blog");
      if (!result.ok) throw new Error(result.error.message);

      const { uploadUrl, finalKey } = result.data;
      const res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!res.ok) throw new Error("Failed pushing to storage");

      toast({ title: "Image uploaded successfully", variant: "success" });
      return finalKey;
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
      return null;
    }
  }

  async function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          const key = await handleImageUpload(file);
          if (key) {
            set("content", form.content + `\n![${file.name}](${key})\n`);
          }
        }
      }
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.14))] overflow-hidden bg-muted/30">
      {/* Editor Header */}
      <header className="shrink-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/portfolio/blog")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              {isEdit ? "Edit Post" : "New Post"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEdit ? blog?.slug : "Draft"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/portfolio/blog")}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={pending} className="gap-2">
            <Save className="size-4" />
            {pending ? "Saving…" : "Save Post"}
          </Button>
        </div>
      </header>

      {/* Editor Body */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex min-h-full flex-col gap-6 p-4 md:p-6 lg:p-8">
          <Input
            className="h-auto shrink-0 border-0 bg-transparent p-3 text-2xl font-extrabold focus-visible:ring-0 md:text-2xl lg:text-3xl"
            placeholder="Post Title..."
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />

          {/* Top Settings Area */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Publishing Settings */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => set("date", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Author</Label>
                  <Input
                    placeholder="John Doe"
                    value={form.author}
                    onChange={(e) => set("author", e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Featured</Label>
                    <p className="text-xs text-muted-foreground">
                      Pin this post to the top
                    </p>
                  </div>
                  <Switch
                    checked={form.featured}
                    onCheckedChange={(c) => set("featured", c)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Metadata Settings */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Metadata</CardTitle>
                <CardDescription>
                  Used for previews and SEO.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Input
                      placeholder="Engineering"
                      value={form.category}
                      onChange={(e) => set("category", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tags</Label>
                    <TagInput
                      placeholder="Add tag…"
                      value={form.tags}
                      onChange={(t) => set("tags", t)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Cover Image Path</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="blog/cover.png"
                        value={form.coverImage ?? ""}
                        onChange={(e) => set("coverImage", e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => document.getElementById("cover-upload")?.click()}
                      >
                        <Upload className="size-4" />
                      </Button>
                      <input
                        type="file"
                        id="cover-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const key = await handleImageUpload(file);
                            if (key) set("coverImage", key);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Reading Time</Label>
                    <Input
                      placeholder="5 min"
                      value={form.readingTime ?? ""}
                      onChange={(e) => set("readingTime", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label>Excerpt</Label>
                    <Textarea
                      placeholder="Brief summary…"
                      value={form.excerpt ?? ""}
                      onChange={(e) => set("excerpt", e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Markdown Editor */}
          <div
            data-color-mode="light"
            className="flex flex-1 flex-col min-h-[500px] w-full"
            onPaste={handlePaste}
          >
            <MDEditor
              value={form.content}
              onChange={(val) => set("content", val || "")}
              height="100%"
              className="flex-1 overflow-hidden rounded-xl border border-border"
              previewOptions={{
                className: "prose dark:prose-invert max-w-none p-4",
                components: {
                  img: (props: any) => {
                    let src = props.src;
                    if (src && !src.startsWith("http") && !src.startsWith("/")) {
                      src = `/api/v1/storage/image?key=${encodeURIComponent(src)}`;
                    }
                    return <img {...props} src={src} />;
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
