"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="relative mb-8">
        <span className="text-[120px] font-bold leading-none tracking-tighter text-border sm:text-[180px]">
          500
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-destructive/10 px-6 py-2">
            <span className="text-sm font-semibold text-destructive">
              Something went wrong
            </span>
          </div>
        </div>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        An unexpected error occurred
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        {process.env.NODE_ENV === "development"
          ? error.message
          : "We encountered an issue processing your request. Please try again."}
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-brand-600"
        >
          Try Again
        </button>
        <Link
          href="/home"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Go to Dashboard
        </Link>
      </div>
      <div className="mt-12 flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex size-6 items-center justify-center rounded-md bg-brand-500 text-[10px] font-bold text-white">
          AI
        </div>
        AI-ME Template Dashboard
      </div>
    </div>
  );
}
