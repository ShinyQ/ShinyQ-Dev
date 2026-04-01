"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import { Save } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { TextareaList } from "@/components/ui/textarea-list";
import { toast } from "@/hooks/use-toast";
import {
  getAboutAction,
  updateAboutAction,
} from "@/lib/actions/portfolio/portfolio.actions";
import type { AboutInfo } from "@/lib/actions/portfolio/portfolio.types";

export function AboutEditor() {
  const [form, setForm] = useState<AboutInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, startSaving] = useTransition();

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await getAboutAction();
    if (result.ok) {
      setForm(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "Failed to load about info",
        description: result.error.message,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function set<K extends keyof AboutInfo>(key: K, val: AboutInfo[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: val } : prev));
  }

  function handleSave() {
    if (!form) return;
    startSaving(async () => {
      const result = await updateAboutAction(form);
      if (result.ok) {
        toast({
          title: "About info saved",
          description: "Your profile information has been updated.",
          variant: "success",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error.message,
        });
      }
    });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="space-y-6 pb-10">
      {/* Intro */}
      <Card>
        <CardHeader>
          <CardTitle>Introduction</CardTitle>
          <CardDescription>
            Your professional introduction displayed on the about page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="about-intro">Intro Text</Label>
            <Textarea
              id="about-intro"
              value={form.intro}
              onChange={(e) => set("intro", e.target.value)}
              rows={5}
              placeholder="Write about yourself…"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="about-quote">Quote</Label>
              <Input
                id="about-quote"
                value={form.quote ?? ""}
                onChange={(e) => set("quote", e.target.value)}
                placeholder="Your favorite quote…"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="about-photo">Profile Photo Path</Label>
              <Input
                id="about-photo"
                value={form.profilePhoto ?? ""}
                onChange={(e) => set("profilePhoto", e.target.value)}
                placeholder="photo/profile.png"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Philosophy */}
      <Card>
        <CardHeader>
          <CardTitle>Philosophy</CardTitle>
          <CardDescription>
            Your engineering philosophy and principles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TextareaList
            value={form.philosophy}
            onChange={(items) => set("philosophy", items)}
            placeholder="Add a philosophy point…"
            addLabel="Add point"
          />
        </CardContent>
      </Card>

      {/* Working Style */}
      <Card>
        <CardHeader>
          <CardTitle>Working Style</CardTitle>
          <CardDescription>
            How you prefer to work and collaborate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TextareaList
            value={form.workingStyle}
            onChange={(items) => set("workingStyle", items)}
            placeholder="Describe your working style…"
            addLabel="Add point"
          />
        </CardContent>
      </Card>

      {/* Favorite Tech */}
      <Card>
        <CardHeader>
          <CardTitle>Favorite Technologies</CardTitle>
          <CardDescription>
            Your go-to technologies and tools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TextareaList
            value={form.favoriteTech}
            onChange={(items) => set("favoriteTech", items)}
            placeholder="Describe a favorite technology…"
            addLabel="Add technology"
          />
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          <Save className="size-4" />
          {saving ? "Saving…" : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}
