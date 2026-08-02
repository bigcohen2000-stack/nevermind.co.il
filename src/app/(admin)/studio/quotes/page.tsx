import Link from "next/link";

import { StudioQuotesPanel } from "@/components/studio/studio-quotes-panel";
import { StudioNav } from "@/components/studio/studio-nav";
import { StudioSessionRequired } from "@/components/studio/studio-session-required";
import { listStudioQuotes } from "@/lib/studio/quotes";
import { isStudioAuthenticated } from "@/lib/studio/session";

export const dynamic = "force-dynamic";

export default async function StudioQuotesPage() {
  const unlocked = await isStudioAuthenticated();

  if (!unlocked) {
    return <StudioSessionRequired />;
  }

  const quotes = await listStudioQuotes();

  return (
    <main className="mx-auto w-full max-w-5xl space-y-10 px-6 py-12 sm:py-16">
      <header className="space-y-6">
        <StudioNav
          active="quotes"
          actions={
            <Link
              href="/studio"
              className="border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
            >
              חזרה לסטודיו
            </Link>
          }
        />
        <div>
          <p className="text-xs text-zinc-500">ניהול פנימי</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
            הצעות מחיר
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            יצירת הצעות ללקוחות. קישור תשלום מודבק ידנית אחרי אישור (חשבונית
            ירוקה / סליקה יחוברו בנפרד).
          </p>
        </div>
      </header>

      <StudioQuotesPanel initialQuotes={quotes} />
    </main>
  );
}
