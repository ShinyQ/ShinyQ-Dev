"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email || undefined }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Login failed");
      router.push("/home");
      router.refresh();
    } catch {
      setError("Could not sign in. Check the API route.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 p-12 text-white lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 text-sm font-bold backdrop-blur">
              AI
            </div>
            <span className="text-lg font-semibold tracking-wide">
              AI-ME Dashboard
            </span>
          </div>
        </div>
        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Build better products with real-time insights
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            A production-ready template for building modern admin dashboards
            with Next.js, FastAPI, and a comprehensive design system.
          </p>
        </div>
        <p className="text-sm text-white/40">
          &copy; {new Date().getFullYear()} AI-ME Template. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold text-white">
              AI
            </div>
            <span className="text-lg font-semibold">AI-ME Dashboard</span>
          </div>

          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="space-y-1 px-0 lg:px-6">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Enter your email to sign in to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 lg:px-6">
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="h-11"
                  />
                </div>
                {error ? (
                  <div
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    role="alert"
                  >
                    {error}
                  </div>
                ) : null}
                <Button
                  type="submit"
                  className="h-11 w-full text-sm font-medium"
                  disabled={pending}
                >
                  {pending ? "Signing in..." : "Sign in"}
                </Button>
              </form>
              <p className="mt-6 text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button type="button" className="text-primary hover:underline">
                  Get started
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
