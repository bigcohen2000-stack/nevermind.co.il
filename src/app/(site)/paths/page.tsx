import type { Metadata } from "next";
import Link from "next/link";

import { getPremiumStatus } from "@/actions/premium";
import { AccessUpgradeStrip } from "@/components/access/access-upgrade-strip";
import { InvestigationFactsStrip } from "@/components/members/investigation-facts-strip";
import { PricingTracks } from "@/components/paths/pricing-tracks";
import { WhatsAppTrackCta } from "@/components/paths/whatsapp-track-cta";
import { ProductFaq } from "@/components/seo/product-faq";
import { resolveSiteAccessTier } from "@/lib/access/site-tier";
import { getHeaderSession } from "@/lib/auth/header-session";
import {
  buildIntroCallWhatsAppText,
  PATHS_FAQ,
} from "@/lib/content/offers";
import { shareImageMetadata } from "@/lib/og/share-image";
import { buildBreadcrumbList } from "@/lib/seo/breadcrumb-json-ld";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "מסלולים ומחירים",
  description:
    "מסלולי ייעוץ ומסגרות גישה למאגר NeverMind. בקשה בוואטסאפ עם מסלול ומחיר לפני מע\"מ. בדיקת התאמה. אין סליקה באתר.",
  alternates: {
    canonical: "https://nevermind.co.il/paths",
  },
  ...shareImageMetadata("מסלולים ומחירים. בקשה מדויקת, לא שיחה כללית."),
};

export default async function PathsPage() {
  const [premium, session] = await Promise.all([
    getPremiumStatus().catch(() => ({
      hasVideoAccess: false,
    })),
    getHeaderSession().catch(() => ({
      authUserId: null as string | null,
    })),
  ]);
  const accessTier = resolveSiteAccessTier({
    authUserId: session.authUserId,
    entitled: Boolean(premium.hasVideoAccess),
  });
  const breadcrumbLd = buildBreadcrumbList([
    { name: "בית", path: "/" },
    { name: "מסלולים", path: "/paths" },
  ]);

  return (
    <main className="w-full text-start">
      <JsonLd data={breadcrumbLd} />
      <InvestigationFactsStrip
        tone="paper"
        factIds={["hours", "concepts", "levels", "views", "since"]}
        moreHref="/members"
        moreLabel="למאגר המועדון"
      />
      {accessTier !== "club" ? (
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
          <AccessUpgradeStrip tier={accessTier} density="section" />
        </div>
      ) : null}
      <PricingTracks hasVideoAccess={Boolean(premium.hasVideoAccess)} />

      <section className="border-t border-[#1A1A1A] bg-[#1A1A1A] text-[#FAFAF8]">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            לא בטוחים איזה מסלול?
          </h2>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-[#9CA3AF]">
            בקשו שיחת היכרות לבדיקת התאמה בלבד (כ-10 דקות). אינה שיחת ייעוץ.
            וואטסאפ או SMS.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <WhatsAppTrackCta
              message={buildIntroCallWhatsAppText()}
              label="בקשת שיחת התאמה"
              tone="dark"
            />
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-none border border-[#FAFAF8] px-5 py-3 text-sm font-medium text-[#FAFAF8] shadow-none transition hover:bg-[#FAFAF8]/10"
            >
              עמוד יצירת קשר
            </Link>
          </div>
        </div>
      </section>

      <ProductFaq
        items={PATHS_FAQ}
        title="שאלות על מסלולים ומחירים"
        headingId="paths-faq-title"
        tone="paper"
      />
    </main>
  );
}
