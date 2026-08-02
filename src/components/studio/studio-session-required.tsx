import Link from "next/link";

import { getStudioGateSlug } from "@/lib/studio/token";

/**
 * Fallback if a studio page renders without a session
 * (middleware should 404 first; this is defense in depth).
 */
export function StudioSessionRequired() {
  const gate = `/${getStudioGateSlug()}`;
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-6 py-16">
      <h1 className="text-xl font-semibold tracking-tight text-zinc-50">
        נדרשת כניסת ניהול
      </h1>
      <p className="mt-3 text-sm text-zinc-400">
        פג תוקף הסשן, או שאין גישה. היכנסו דרך נתיב הניהול האישי.
      </p>
      <p className="mt-6">
        <Link
          href={gate}
          className="inline-flex rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950"
        >
          כניסה
        </Link>
      </p>
    </main>
  );
}
