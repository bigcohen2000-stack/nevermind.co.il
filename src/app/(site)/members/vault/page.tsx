import type { Metadata } from "next";
import Link from "next/link";

import { listPublishedClubAssets } from "@/actions/club-assets";
import { ClubVaultList } from "@/components/members/club-vault-list";
import { resolveVideoEntitlement } from "@/lib/club/access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "כספת נכסים",
  description: "הורדות מאובטחות לחברי מועדון: תבניות, מפרטים וקבצי מקור.",
  robots: { index: false, follow: false },
};

export default async function MembersVaultPage() {
  const entitlement = await resolveVideoEntitlement().catch(() => ({
    entitled: false,
    hasVideoAccess: false,
  }));
  const unlocked = entitlement.entitled || entitlement.hasVideoAccess;

  if (!unlocked) {
    return (
      <main className="min-h-full w-full bg-zinc-950 text-zinc-100">
        <div className="mx-auto w-full max-w-lg px-6 py-16">
          <h1 className="text-3xl font-semibold tracking-tight">כספת נכסים</h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            הכספת פתוחה לחברי מועדון בלבד. אחרי כניסה אפשר להוריד תבניות
            ומפרטים עם קישור חתום קצר-חיים.
          </p>
          <Link href="/members#login" className="btn btn-primary mt-8 text-sm">
            כניסת מועדון
          </Link>
        </div>
      </main>
    );
  }

  const assets = await listPublishedClubAssets();

  return (
    <main className="min-h-full w-full bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-3xl px-6 py-16 lg:py-24">
        <p className="text-xs tracking-[0.2em] text-zinc-500">מועדון</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">
          כספת נכסים
        </h1>
        <p className="mt-4 max-w-prose text-sm text-zinc-400">
          הורדות מאובטחות. כל קישור תקף לזמן קצר אחרי לחיצה.
        </p>
        <p className="mt-3 text-sm">
          <Link
            href="/members"
            className="text-zinc-300 underline-offset-2 hover:underline"
          >
            חזרה למועדון
          </Link>
        </p>
        <ClubVaultList assets={assets} />
      </div>
    </main>
  );
}
