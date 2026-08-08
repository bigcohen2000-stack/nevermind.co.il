import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AccessUpgradeStrip } from "@/components/access/access-upgrade-strip";
import { MyListSignInForm } from "@/components/auth/my-list-sign-in-form";
import { SmartEmptyState } from "@/components/ui/smart-empty-state";
import { VideoCard } from "@/components/videos/video-card";
import { listCompletedVideos } from "@/actions/video-completions";
import { listSavedVideos } from "@/actions/saved-videos";
import { listWatchHistory } from "@/actions/watch-history";
import { resolveVideoEntitlement } from "@/lib/club/access";
import { resolveSiteAccessTier } from "@/lib/access/site-tier";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "הרשימה שלי",
  description: "סרטונים ששמרת, המשך צפייה, וקיצורי דרך לחשבון.",
  robots: { index: false, follow: false },
};

const HUB_LINKS = [
  {
    href: "/videos",
    emoji: "🎬",
    title: "ספריית וידאו",
    body: "לעיון בסרטונים פתוחים ובמאגר המועדון.",
  },
  {
    href: "/search",
    emoji: "🔍",
    title: "חיפוש",
    body: "מושגים ותמלילים. מוצאים נקודת כניסה מהירה.",
  },
  {
    href: "/members",
    emoji: "🔑",
    title: "מועדון",
    body: "כניסה למאגר החסום עם טלפון וסיסמה או קישור.",
  },
  {
    href: "/profile",
    emoji: "👤",
    title: "פרופיל",
    body: "חשבון, היסטוריה מלאה, ושתי שכבות הגישה.",
  },
  {
    href: "/articles",
    emoji: "📖",
    title: "מאמרים",
    body: "טקסטים קצרים על מנגנונים ומחשבה.",
  },
  {
    href: "/contact",
    emoji: "✉️",
    title: "יצירת קשר",
    body: "שאלה, תיאום, או בקשת גישה.",
  },
] as const;

function formatWatchedAt(iso: string): string {
  return new Date(iso).toLocaleString("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function MyListPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const authErrorRaw = params.auth_error;
  const authError =
    typeof authErrorRaw === "string"
      ? authErrorRaw
      : Array.isArray(authErrorRaw)
        ? authErrorRaw[0]
        : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-full w-full bg-zinc-950 text-zinc-100">
        <div className="mx-auto flex w-full max-w-lg flex-col px-6 py-16 sm:py-24">
          <p className="text-xs font-medium tracking-[0.2em] text-zinc-500">
            <span aria-hidden="true" className="me-2">
              ⭐
            </span>
            הרשימה שלי
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            התחברות לרשימה האישית
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            הרשימה שומרת סרטונים להמשך. היסטוריית צפייה נשמרת בחשבון. התחברות
            בחינם עם קישור לאימייל. בלי סיסמה.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-zinc-400">
            <li className="flex gap-3">
              <span aria-hidden="true">⭐</span>
              <span>שמירת סרטונים מהכרטיס או מדף הצפייה.</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true">⏯️</span>
              <span>המשך מאיפה שעצרת, אחרי התחברות.</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true">🔑</span>
              <span>מועדון נשאר שכבה נפרדת: טלפון וסיסמה או קישור.</span>
            </li>
          </ul>

          <MyListSignInForm
            nextPath="/my-list"
            initialError={authError}
          />
          <p className="mt-6 text-sm text-zinc-400">
            אין חשבון?{" "}
            <Link
              href="/profile?mode=register"
              className="text-zinc-100 underline-offset-2 hover:underline"
            >
              חשבון חינם
            </Link>
            . כבר יש חשבון? בקשו קישור למעלה.
          </p>
          <p className="mt-4 text-sm text-zinc-500">
            חשבון מייל לא פותח את המאגר.{" "}
            <Link
              href="/members#access"
              className="text-zinc-200 underline-offset-2 hover:underline"
            >
              בקשת גישה למועדון
            </Link>
            .
          </p>
          <p className="mt-8 text-sm text-zinc-500">
            או חזור ל{" "}
            <Link
              href="/videos"
              className="text-zinc-200 underline-offset-2 hover:underline"
            >
              ספריית הווידאו
            </Link>
            .
          </p>
        </div>
      </main>
    );
  }

  const [videos, history, completed, entitlement] = await Promise.all([
    listSavedVideos(),
    listWatchHistory(8),
    listCompletedVideos(12),
    resolveVideoEntitlement().catch(() => ({
      entitled: false,
      hasVideoAccess: false,
    })),
  ]);
  const accessTier = resolveSiteAccessTier({
    authUserId: user.id,
    entitled: entitlement.entitled || entitlement.hasVideoAccess,
  });

  return (
    <main className="min-h-full w-full bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-24">
        <p className="text-xs font-medium tracking-[0.2em] text-zinc-500">
          <span aria-hidden="true" className="me-2">
            ⭐
          </span>
          מרחב אישי
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 lg:text-5xl">
          הרשימה שלי
        </h1>
        <p className="mt-4 max-w-prose leading-relaxed text-zinc-400">
          כאן נשמרים סרטונים שסימנת, והמשך צפייה אחרונה. החשבון אישי. מאגר
          המועדון נפתח בנפרד.
        </p>

        {accessTier !== "club" ? (
          <div className="mt-8 max-w-xl border border-zinc-700 bg-zinc-900/60 p-4 [&_.btn-primary]:border-red-600 [&_.btn-primary]:bg-red-600 [&_.btn-secondary]:border-zinc-500 [&_.btn-secondary]:text-zinc-100">
            <AccessUpgradeStrip tier={accessTier} density="section" />
          </div>
        ) : null}

        <section
          aria-labelledby="my-list-hub-title"
          className="mt-10"
        >
          <h2 id="my-list-hub-title" className="sr-only">
            קיצורי דרך
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {HUB_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex h-full gap-3 border border-zinc-800 bg-zinc-900/50 p-4 no-underline transition hover:border-zinc-600 hover:no-underline"
                >
                  <span aria-hidden="true" className="text-xl">
                    {item.emoji}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-zinc-100">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-zinc-500">
                      {item.body}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14" aria-labelledby="my-list-saved-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="my-list-saved-title"
                className="text-xl font-semibold tracking-tight text-zinc-100"
              >
                <span aria-hidden="true" className="me-2">
                  ⭐
                </span>
                {videos.length === 0
                  ? "עדיין אין סרטונים שמורים"
                  : `סרטונים שמורים (${videos.length})`}
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                לוחצים על הסימניה בכרטיס או בצפייה. אפשר להסיר בכל רגע.
              </p>
            </div>
            <Link
              href="/videos"
              className="text-sm text-zinc-300 underline-offset-2 hover:underline"
            >
              לספרייה
            </Link>
          </div>

          {videos.length === 0 ? (
            <SmartEmptyState
              tone="dark"
              message="אין שמורים עדיין. פתחו סרטון, לחצו על הסימניה, והוא יופיע כאן. בינתיים: מושגי ליבה במאגר."
            />
          ) : (
            <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <li key={video.id}>
                  <VideoCard
                    video={video}
                    initialSaved
                    initialCompleted={completed.some(
                      (c) => c.youtube_id === video.youtube_id,
                    )}
                    tone="dark"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-16" aria-labelledby="my-list-completed-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="my-list-completed-title"
                className="text-xl font-semibold tracking-tight text-zinc-100"
              >
                הושלמו
                {completed.length > 0 ? ` (${completed.length})` : ""}
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                סרטונים שסימנת כהושלמו או שהגעת לסופם.
              </p>
            </div>
          </div>

          {completed.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-500">
              עדיין אין סרטונים שהושלמו. בסוף צפייה או בלחיצה על &quot;סמן
              כהושלם&quot; הם יופיעו כאן.
            </p>
          ) : (
            <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {completed.map((video) => (
                <li key={video.id}>
                  <VideoCard
                    video={video}
                    initialCompleted
                    tone="dark"
                    hasFullAccess={
                      entitlement.entitled || entitlement.hasVideoAccess
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-16" aria-labelledby="my-list-history-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="my-list-history-title"
                className="text-xl font-semibold tracking-tight text-zinc-100"
              >
                <span aria-hidden="true" className="me-2">
                  ⏯️
                </span>
                המשך צפייה
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                סרטונים שפתחת לאחרונה. ההיסטוריה המלאה בפרופיל.
              </p>
            </div>
            <Link
              href="/profile"
              className="text-sm text-zinc-300 underline-offset-2 hover:underline"
            >
              לפרופיל
            </Link>
          </div>

          {history.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-500">
              עדיין אין היסטוריה. התחילו סרטון והוא יופיע כאן.
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-zinc-800 border border-zinc-800">
              {history.map((item) => {
                const thumb =
                  item.thumbnail_url ??
                  `https://i.ytimg.com/vi/${item.youtube_id}/hqdefault.jpg`;
                return (
                  <li key={`${item.youtube_id}-${item.watchedAt}`}>
                    <Link
                      href={`/watch/${item.youtube_id}`}
                      className="flex gap-4 p-4 text-zinc-100 no-underline transition hover:bg-zinc-900 hover:no-underline"
                    >
                      <div className="relative h-14 w-24 shrink-0 overflow-hidden bg-zinc-900 sm:h-16 sm:w-28">
                        <Image
                          src={thumb}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium tracking-tight">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          נצפה {formatWatchedAt(item.watchedAt)}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-16 border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold tracking-tight">
            <span aria-hidden="true" className="me-2">
              ℹ️
            </span>
            איך זה עובד
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-400">
            <li>
              <strong className="font-medium text-zinc-200">חשבון אתר:</strong>{" "}
              קישור לאימייל. שומר רשימה, היסטוריה, והתמליל המלא בצפייה.
            </li>
            <li>
              <strong className="font-medium text-zinc-200">מועדון:</strong>{" "}
              טלפון וסיסמה או קישור. פותח סרטונים לא רשומים במכשיר הזה.
            </li>
            <li>
              שתי השכבות נפרדות. אפשר להיות מחוברים לשתיהן יחד, או רק לאחת.
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/members#login" className="btn btn-secondary text-sm">
              <span aria-hidden="true" className="me-1.5">
                🔑
              </span>
              כניסת מועדון
            </Link>
            <Link href="/profile" className="btn btn-secondary text-sm">
              <span aria-hidden="true" className="me-1.5">
                👤
              </span>
              ניהול חשבון
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
