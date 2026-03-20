"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "src/components/ui/button";
import { Utensils, Sparkles, BarChart3, Zap } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (isSignedIn) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500">
            <Utensils className="h-[18px] w-[18px] text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-900">CalorIQ</span>
        </div>
        <Link href="/sign-in">
          <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900">
            Sign in
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-5 sm:px-8">
        <div className="mx-auto max-w-lg text-center sm:max-w-xl">
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
            <Sparkles className="h-3 w-3" />
            AI-Powered Tracking
          </div>

          {/* Headline */}
          <h1 className="mb-3 text-[2rem] font-extrabold leading-[1.1] tracking-tight text-zinc-900 sm:text-5xl">
            Track smarter.
            <br />
            <span className="text-orange-500">Eat better.</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-8 max-w-sm text-[15px] leading-relaxed text-zinc-500 sm:max-w-md sm:text-base">
            Describe what you ate in plain English. CalorIQ breaks down
            calories, macros, and more — instantly.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="h-11 rounded-lg bg-orange-500 px-7 text-sm font-semibold shadow-sm hover:bg-orange-600 active:bg-orange-700"
              >
                Get started free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                variant="outline"
                size="lg"
                className="h-11 rounded-lg border-zinc-200 px-7 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-16 grid w-full max-w-lg gap-3 sm:max-w-2xl sm:grid-cols-3 sm:gap-4">
          <FeatureCard
            icon={<Zap className="h-4 w-4 text-amber-500" />}
            title="Instant Logging"
            description='Type "2 eggs and toast" and we handle the rest.'
          />
          <FeatureCard
            icon={<BarChart3 className="h-4 w-4 text-orange-500" />}
            title="Smart Insights"
            description="Track calories, protein, carbs, and fat at a glance."
          />
          <FeatureCard
            icon={<Sparkles className="h-4 w-4 text-blue-500" />}
            title="AI-Powered"
            description="Natural language understanding for effortless tracking."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-zinc-400">
        CalorIQ &mdash; Your intelligent nutrition companion
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50">
        {icon}
      </div>
      <h3 className="mb-1 text-sm font-semibold text-zinc-900">{title}</h3>
      <p className="text-[13px] leading-relaxed text-zinc-500">{description}</p>
    </div>
  );
}
