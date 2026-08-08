import type { Metadata } from "next";
import Link from "next/link";
import {
  Compass,
  Film,
  Keyboard,
  Search as SearchIcon,
  Tag,
} from "lucide-react";
import { Suspense } from "react";

import { ClubSoftGateNote } from "@/components/access/club-soft-gate-note";
import { SetBreadcrumbCurrent } from "@/components/layout/site-breadcrumbs";
import { RabbitHoleSearchBridge } from "@/components/premium/rabbit-hole-search-bridge";
import { SearchBrowseNav } from "@/components/search/search-browse-nav";
import { HeroSearchSection } from "@/components/search/hero-search-section";
import { JsonLd } from "@/components/seo/json-ld";
import { Eyebrow, Watermark } from "@/components/ui/editorial";
import { SearchResults } from "@/components/videos/search-results";
import { VideoGridSkeleton } from "@/components/videos/video-grid-skeleton";
import { resolveVideoEntitlement } from "@/lib/club/access";
import {
  parseSearchPageParams,
  searchHref,
} from "@/lib/search/search-params";
import { shareImageMetadata } from "@/lib/og/share-image";
import { buildBreadcrumbList } from "@/lib/seo/breadcrumb-json-ld";
import { buildSmsHref, buildWhatsAppHref } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
    filter?: string;
    type?: string;
    tab?: string;
  }>;
};

const SEARCH_HIGHLIGHTS = [
  {
    id: "query",
    icon: SearchIcon,
    title: "חיפוש אחד",
    body: "מאמרים, מושגים וסרטונים באותו מקום.",
  },
  {
    id: "mechanism",
    icon: Compass,
    title: "לפי מנגנון",
    body: "יחסים, קיום או זהות. כניסה מהירה לנושא.",
  },
  {
    id: "filter",
    icon: Film,
    title: "סינון סרטונים",
    body: "הכול, חינם, או מועדון. בלי לחפור.",
  },
  {
    id: "keyboard",
    icon: Keyboard,
    title: "מקלדת",
    body: "הקלד והמתן. הצעות מופיעות תוך כדי כתיבה.",
  },
] as const;

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q, page, filter, type } = parseSearchPageParams(await searchParams);
  const query = q.trim();
  const titleParts = [query ? `חיפוש: ${query}` : "חיפוש"];
  if (page > 1) titleParts.push(`עמוד ${page}`);
  const title = titleParts.join(" | ");
  const ogTitle = query ? `חיפוש: ${query}` : "חקירה לפי נושא";

  const canonicalPath = searchHref({ q: query, page, filter, type });

  return {
    title,
    description: query
      ? `תוצאות חיפוש עבור ${query}. מאמרים, מושגים וסרטונים ב-NeverMind. ניתוח לוגי: הפרדה בין עובדה לסיפור.`
      : "חיפוש מאמרים, מושגים וסרטונים ב-NeverMind. ניתוח לוגי של המציאות: הפרדה בין עובדה לבין סיפור.",
    alternates: {
      canonical: `https://nevermind.co.il${canonicalPath}`,
    },
    ...shareImageMetadata(ogTitle),
    ...(page > 1 || filter !== "all" || type !== "all"
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, page, filter, type } = parseSearchPageParams(await searchParams);
  const query = q;
  const access = await resolveVideoEntitlement().catch(() => ({
    entitled: false,
    hasVideoAccess: false,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NeverMind",
    alternateName: ["NeverMinde", "השם לא משנה"],
    url: "https://nevermind.co.il",
    inLanguage: "he-IL",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://nevermind.co.il/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const breadcrumbLd = buildBreadcrumbList([
    { name: "בית", path: "/" },
    { name: "חיפוש", path: "/search" },
    ...(query
      ? [
          {
            name: query.slice(0, 48),
            path: searchHref({ q: query, filter, type }),
          },
        ]
      : []),
  ]);

  return (
    <main className="w-full bg-background text-foreground text-start">
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbLd} />
      {query ? <SetBreadcrumbCurrent title={query.slice(0, 48)} /> : null}

      <section aria-labelledby="search-hero-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-foreground/[0.045] sm:text-[9rem] lg:text-[13rem]">
          חיפוש
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <Eyebrow onDark>חיפוש</Eyebrow>
          <h1
            id="search-hero-title"
            className="mt-5 max-w-3xl text-fluid-display font-semibold leading-[1.05] tracking-tight"
          >
            חקירה לפי נושא
          </h1>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-foreground/80">
            חפש מאמר, מושג או סרטון. סנן לפי סוג תוצאה, מנגנון, או גישה לסרטונים.
            סרטוני מועדון מסומנים. חיפוש תמלילים מלא נפתח אחרי כניסת מועדון.
          </p>
          <p className="mt-3 max-w-prose text-sm text-foreground/65">
            רוצים תמלילים מלאים?{" "}
            <Link
              href="/members#access"
              className="text-action underline-offset-2 hover:underline"
            >
              בקשת גישה למועדון
            </Link>
            .
          </p>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SEARCH_HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.id}
                  className="border border-foreground/15 bg-foreground/[0.03] p-4"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Icon className="size-4 text-action" aria-hidden />
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                    {item.body}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="mt-10 max-w-2xl">
            <HeroSearchSection
              initialQuery={query}
              syncUrl
              variant="dark"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <RabbitHoleSearchBridge
          query={query}
          hasVideoAccess={access.entitled || access.hasVideoAccess}
        />

        <section
          aria-labelledby="search-browse-title"
          className="border border-foreground/10 bg-paper p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="search-browse-title"
              className="text-lg font-semibold tracking-tight"
            >
              ניווט מהיר
            </h2>
            <Link
              href="/videos"
              className="inline-flex items-center gap-1.5 text-sm text-action no-underline hover:underline"
            >
              <Tag className="size-3.5" aria-hidden />
              לכל הסרטונים
            </Link>
          </div>
          <SearchBrowseNav
            q={query}
            type={type}
            filter={filter}
            className="mt-5"
          />
        </section>

        <section className="mt-12 sm:mt-14" aria-labelledby="results-title">
          <h2
            id="results-title"
            className="text-lg font-semibold tracking-tight sm:text-xl"
          >
            {query ? `תוצאות עבור "${query}"` : "תוכן אחרון לחקירה"}
          </h2>
          {query && (filter !== "all" || type !== "all") ? (
            <p className="mt-2 text-sm text-muted">
              {type !== "all" ? `סוג: ${typeLabel(type)}. ` : null}
              {filter !== "all"
                ? `סרטונים: ${filter === "open" ? "חינם" : "מועדון"}.`
                : null}{" "}
              <Link
                href={searchHref({ q: query })}
                className="text-action no-underline hover:underline"
              >
                נקה סינון
              </Link>
            </p>
          ) : null}
          {filter === "club" ? (
            <ClubSoftGateNote className="mt-3 text-sm leading-relaxed text-muted" />
          ) : null}

          <Suspense
            fallback={
              <VideoGridSkeleton count={9} className="mt-6 sm:mt-8" />
            }
          >
            <SearchResults
              query={query}
              page={page}
              filter={filter}
              type={type}
            />
          </Suspense>
        </section>

        {query ? (
          <aside
            className="mt-14 border border-action/40 bg-paper p-6 sm:p-8"
            aria-labelledby="search-booking-title"
          >
            <p
              id="search-booking-title"
              className="text-xs font-medium tracking-wide text-action"
            >
              תיאום שיחה
            </p>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-foreground sm:text-lg">
              רוצה לדבר על מה שחיפשת:{" "}
              <span className="font-semibold">{query}</span>? שלח הודעה בטלפון.
              וואטסאפ או SMS.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={buildWhatsAppHref(
                  [
                    "היי יקיר, הגעתי מחיפוש באתר.",
                    `חיפשתי: ${query}`,
                    "אשמח לתאם שיחה.",
                  ].join("\n"),
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                וואטסאפ
              </a>
              <a
                href={buildSmsHref(
                  [
                    "היי יקיר, הגעתי מחיפוש באתר.",
                    `חיפשתי: ${query}`,
                    "אשמח לתאם שיחה.",
                  ].join("\n"),
                )}
                className="btn btn-secondary"
              >
                SMS
              </a>
              <Link href="/contact?from=search" className="btn btn-secondary">
                טופס יצירת קשר
              </Link>
            </div>
          </aside>
        ) : null}
      </div>
    </main>
  );
}

function typeLabel(
  type: "videos" | "articles" | "concepts" | "mechanisms" | "all",
): string {
  switch (type) {
    case "videos":
      return "סרטונים";
    case "articles":
      return "מאמרים";
    case "concepts":
      return "מושגים";
    case "mechanisms":
      return "מנגנונים";
    default:
      return "הכול";
  }
}
