"use client";

import Link from "next/link";

export default function ProfileError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-full w-full bg-background px-6 py-16 text-foreground">
      <div className="mx-auto w-full max-w-lg space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          לא הצלחנו לטעון את הפרופיל
        </h1>
        <p className="text-sm text-muted">אפשר לנסות שוב, או לחזור לעמוד הבית.</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary" onClick={reset}>
            נסו שוב
          </button>
          <Link href="/" className="btn btn-secondary">
            לעמוד הבית
          </Link>
        </div>
      </div>
    </main>
  );
}
