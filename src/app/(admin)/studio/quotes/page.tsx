import Link from "next/link";

import { StudioQuotesPanel } from "@/components/studio/studio-quotes-panel";
import { StudioPageShell } from "@/components/studio/studio-page-shell";
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
    <StudioPageShell
      active="quotes"
      title="הצעות מחיר"
      description="יצירת הצעות ללקוחות. קישור תשלום מודבק ידנית אחרי אישור (חשבונית ירוקה / סליקה יחוברו בנפרד)."
      actions={
        <Link
          href="/studio"
          className="border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
        >
          חזרה לסטודיו
        </Link>
      }
    >
      <StudioQuotesPanel initialQuotes={quotes} />
    </StudioPageShell>
  );
}
