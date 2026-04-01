import Link from "next/link";

export default function AuthenticatedNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6">
        <span className="text-[80px] font-bold leading-none tracking-tighter text-border sm:text-[120px]">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-primary/10 px-6 py-2">
            <span className="text-sm font-semibold text-primary">
              Page not found
            </span>
          </div>
        </div>
      </div>
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for might have been moved, deleted, or
        never existed in the first place.
      </p>
      <div className="mt-6">
        <Link
          href="/home"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-brand-600"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
