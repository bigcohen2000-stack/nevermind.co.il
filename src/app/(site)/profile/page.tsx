import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { logoutClub } from "@/actions/club-login";
import { listWatchHistory } from "@/actions/watch-history";
import { AccessUpgradeStrip } from "@/components/access/access-upgrade-strip";
import { MyListSignInForm } from "@/components/auth/my-list-sign-in-form";
import { ClearWatchHistoryButton } from "@/components/profile/clear-watch-history-button";
import { ClubMemberVoucher } from "@/components/profile/club-member-voucher";
import { LiveNotifySettings } from "@/components/profile/live-notify-settings";
import { ProgressDashboard } from "@/components/profile/progress-dashboard";
import { TopicPrefsSettings } from "@/components/profile/topic-prefs-settings";
import { UiDensityToggle } from "@/components/profile/ui-density-toggle";
import { SignOutButton } from "@/components/profile/sign-out-button";
import { listTopicPrefOptions } from "@/actions/topic-prefs";
import { listCompletedVideos } from "@/actions/video-completions";
import { resolveSiteAccessTier } from "@/lib/access/site-tier";
import { resolveVideoEntitlement } from "@/lib/club/access";
import { maskClubPhone } from "@/lib/club/phone";
import { getClubVoucherState } from "@/lib/profile/club-voucher";
import { getProfileProgressStats } from "@/lib/profile/progress-stats";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "פרופיל",
  description: "פרטי חשבון והיסטוריית צפייה.",
  robots: { index: false, follow: false },
};

function formatWatchedAt(iso: string): string {
  return new Date(iso).toLocaleString("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; tab?: string; auth_error?: string }>;
}) {
  const params = await searchParams;
  const isRegister = params.mode === "register";
  const showSettings = params.tab === "settings";
  const authError =
    typeof params.auth_error === "string" ? params.auth_error : "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const club = await resolveVideoEntitlement().catch(() => ({
    entitled: false,
    clubSession: false,
    hasVideoAccess: false,
    isAuthenticated: false,
    phone: null as string | null,
    displayName: null as string | null,
  }));

  if (!user) {
    return (
      <main className="min-h-full w-full bg-[#000000] text-[#FAFAF8]">
        <div className="mx-auto flex w-full max-w-lg flex-col px-6 py-16 sm:py-24">
          <p className="text-xs font-medium tracking-[0.2em] text-[#9CA3AF]">
            {isRegister ? "הרשמה · שלב 1" : "התחברות"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {isRegister ? "יצירת חשבון" : "התחברות לפרופיל"}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#9CA3AF]">
            {isRegister
              ? "מזינים אימייל ומקבלים קישור להשלמת הרשמה. אחרי האישור תעברו למסך ברוך הבא עם הצעדים הבאים. בלי סיסמה."
              : "היסטוריית צפייה ופרטי חשבון זמינים אחרי התחברות. נשלח קישור לאימייל. בלי סיסמה."}
          </p>
          <MyListSignInForm
            nextPath="/profile"
            intent={isRegister ? "register" : "login"}
            initialError={authError}
          />
          <p className="mt-6 text-sm text-[#9CA3AF]">
            {isRegister ? (
              <>
                כבר יש חשבון?{" "}
                <Link
                  href="/profile"
                  className="text-[#FAFAF8] underline-offset-2 hover:underline"
                >
                  התחברות
                </Link>
              </>
            ) : (
              <>
                אין חשבון?{" "}
                <Link
                  href="/profile?mode=register"
                  className="text-[#FAFAF8] underline-offset-2 hover:underline"
                >
                  הרשמה
                </Link>
              </>
            )}
          </p>
          {club.clubSession ? (
            <section className="mt-10 border border-[#FAFAF8]/10 bg-[#0A0A0B] p-5 text-sm">
              <h2 className="font-semibold tracking-tight">מועדון במכשיר</h2>
              <p className="mt-2 text-[#9CA3AF]">
                {club.displayName ? `${club.displayName}. ` : ""}
                {maskClubPhone(club.phone)}. שכבה נפרדת מחשבון האתר.
              </p>
              <form action={logoutClub} className="mt-4">
                <button
                  type="submit"
                  className="border border-[#FAFAF8]/25 px-3 py-1.5 text-xs text-[#FAFAF8] transition hover:border-[#D42B2B] hover:text-[#D42B2B]"
                >
                  יציאה מהמועדון
                </button>
              </form>
            </section>
          ) : null}
          <p className="mt-8 text-sm text-[#9CA3AF]">
            או חזור ל{" "}
            <Link
              href="/"
              className="text-[#FAFAF8] underline-offset-2 hover:underline"
            >
              עמוד הבית
            </Link>
            .
          </p>
        </div>
      </main>
    );
  }

  const [history, progress, voucher, topicOptions, completed] =
    await Promise.all([
      listWatchHistory(24),
      getProfileProgressStats(user.id),
      club.clubSession && club.phone
        ? getClubVoucherState(club.phone)
        : Promise.resolve(null),
      listTopicPrefOptions(48),
      listCompletedVideos(24),
    ]);

  const accessTier = resolveSiteAccessTier({
    authUserId: user.id,
    entitled: club.entitled || club.hasVideoAccess || club.clubSession,
  });

  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString("he-IL", {
        dateStyle: "medium",
      })
    : null;

  return (
    <main className="min-h-full w-full bg-[#000000] text-[#FAFAF8]">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-24">
        <p className="text-xs font-medium tracking-[0.2em] text-[#9CA3AF]">
          פרופיל
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight lg:text-5xl">
          הפרופיל שלי
        </h1>
        <p className="mt-4 max-w-prose leading-relaxed text-[#9CA3AF]">
          פרטי חשבון, מעקב התקדמות והיסטוריית צפייה. בלי רעש.
        </p>
        <p className="mt-3 text-sm text-[#FAFAF8]/80">
          סטטוס:{" "}
          {accessTier === "club"
            ? "מועדון פעיל"
            : "חשבון פתוח · לשדרוג מועדון"}
        </p>

        <section
          aria-labelledby="account-details-title"
          className="mt-12 border border-[#FAFAF8]/10 bg-[#0A0A0B] p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2
                id="account-details-title"
                className="text-xl font-semibold tracking-tight"
              >
                פרטי חשבון
              </h2>
              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="text-[#9CA3AF]">אימייל</dt>
                  <dd className="mt-1 text-[#FAFAF8]">{user.email ?? "-"}</dd>
                </div>
                {createdAt ? (
                  <div>
                    <dt className="text-[#9CA3AF]">הצטרף</dt>
                    <dd className="mt-1 text-[#FAFAF8]">{createdAt}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-[#9CA3AF]">מזהה</dt>
                  <dd className="mt-1 font-mono text-xs text-[#9CA3AF]">
                    {user.id}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/profile/questions"
                className="border border-[#FAFAF8]/25 px-4 py-2 text-sm text-[#FAFAF8] transition hover:border-[#D42B2B] hover:text-[#D42B2B]"
              >
                שאלות שיטה
              </Link>
              <Link
                href="/my-list"
                className="border border-[#FAFAF8]/25 px-4 py-2 text-sm text-[#FAFAF8] transition hover:border-[#D42B2B] hover:text-[#D42B2B]"
              >
                הרשימה שלי
              </Link>
              <Link
                href="/profile?tab=settings"
                className="border border-[#FAFAF8]/25 px-4 py-2 text-sm text-[#FAFAF8] transition hover:border-[#D42B2B] hover:text-[#D42B2B]"
              >
                הגדרות
              </Link>
              <SignOutButton />
            </div>
          </div>
        </section>

        <section
          id="settings"
          aria-labelledby="settings-title"
          className={`mt-10 border border-[#FAFAF8]/10 bg-[#0A0A0B] p-6 sm:p-8 ${showSettings ? "ring-1 ring-[#D42B2B]/50" : ""}`}
        >
          <h2
            id="settings-title"
            className="text-xl font-semibold tracking-tight"
          >
            הגדרות
          </h2>
          <p className="mt-2 max-w-prose text-sm text-[#9CA3AF]">
            ערכת נושא לחשבון מחובר זמינה מתפריט החשבון בראש האתר. כאן מנהלים
            גישה, רשימה והיסטוריה.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-[#FAFAF8]/85">
            <li>
              <Link
                href="/my-list"
                className="underline-offset-2 hover:underline"
              >
                הרשימה שלי
              </Link>
              {": "}
              סרטונים שנשמרו להמשך חקירה.
            </li>
            <li>
              <a href="#watch-history-title" className="underline-offset-2 hover:underline">
                היסטוריית צפייה
              </a>
              {": "}
              מה שהתחלת לצפות בו במכשיר הזה.
            </li>
            <li>
              <Link
                href="/privacy"
                className="underline-offset-2 hover:underline"
              >
                מדיניות פרטיות
              </Link>
              {": "}
              איך נשמר מידע באתר.
            </li>
          </ul>
          <LiveNotifySettings />
          <UiDensityToggle />
          <div className="mt-10 border-t border-[#FAFAF8]/10 pt-8">
            <h3 className="text-base font-semibold tracking-tight">
              תחומי עניין להתראות
            </h3>
            <TopicPrefsSettings options={topicOptions} />
          </div>
        </section>

        <section
          aria-labelledby="sessions-title"
          className="mt-10 border border-[#FAFAF8]/10 bg-[#0A0A0B] p-6 sm:p-8"
        >
          <h2
            id="sessions-title"
            className="text-xl font-semibold tracking-tight"
          >
            שתי שכבות גישה
          </h2>
          <p className="mt-2 max-w-prose text-sm text-[#9CA3AF]">
            חשבון האתר שומר רשימה והיסטוריה. מועדון פותח מאגר חסום. הן נפרדות.
          </p>
          <ul className="mt-6 space-y-4 text-sm">
            <li className="flex flex-wrap items-center justify-between gap-2 border-b border-[#FAFAF8]/10 pb-4">
              <span>
                <span className="text-[#9CA3AF]">חשבון אתר: </span>
                מחובר ({user.email ?? "משתמש"})
              </span>
            </li>
            <li className="flex flex-wrap items-center justify-between gap-2">
              <span>
                <span className="text-[#9CA3AF]">מועדון: </span>
                {club.clubSession || club.entitled
                  ? `${club.displayName ? `${club.displayName}. ` : ""}${maskClubPhone(club.phone) || "פתוח במכשיר"}`
                  : "לא מחובר במכשיר הזה"}
              </span>
              {club.clubSession ? (
                <form action={logoutClub}>
                  <button
                    type="submit"
                    className="btn btn-secondary border-[#FAFAF8]/25 bg-transparent text-xs text-[#FAFAF8]"
                  >
                    יציאה מהמועדון
                  </button>
                </form>
              ) : (
                <Link
                  href="/members#access"
                  className="btn btn-primary text-xs"
                >
                  בקשת גישה למועדון
                </Link>
              )}
            </li>
          </ul>
          {accessTier !== "club" ? (
            <div className="mt-6 [&_.btn-secondary]:border-[#FAFAF8]/25 [&_.btn-secondary]:bg-transparent [&_.btn-secondary]:text-[#FAFAF8]">
              <AccessUpgradeStrip tier="account" density="section" />
            </div>
          ) : null}
        </section>

        <ProgressDashboard stats={progress} />

        {voucher ? <ClubMemberVoucher voucher={voucher} /> : null}

        {completed.length > 0 ? (
          <section aria-labelledby="completed-videos-title" className="mt-14">
            <h2
              id="completed-videos-title"
              className="text-xl font-semibold tracking-tight lg:text-2xl"
            >
              סרטונים שהושלמו
            </h2>
            <ul className="mt-6 divide-y divide-[#FAFAF8]/10 border border-[#FAFAF8]/10">
              {completed.slice(0, 8).map((item) => (
                <li key={item.youtube_id}>
                  <Link
                    href={`/watch/${item.youtube_id}`}
                    className="block p-4 text-[#FAFAF8] no-underline transition hover:bg-[#141519] hover:no-underline"
                  >
                    <p className="font-semibold tracking-tight">{item.title}</p>
                    <p className="mt-1 text-sm text-[#9CA3AF]">
                      הושלם {formatWatchedAt(item.completedAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="watch-history-title" className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                id="watch-history-title"
                className="text-xl font-semibold tracking-tight lg:text-2xl"
              >
                היסטוריית צפייה
              </h2>
              <p className="mt-2 text-sm text-[#9CA3AF]">
                סרטונים שהתחלת לצפות בהם לאחרונה.
              </p>
            </div>
            {history.length > 0 ? <ClearWatchHistoryButton /> : null}
          </div>

          {history.length === 0 ? (
            <p className="mt-8 text-sm text-[#9CA3AF]">
              אין עדיין היסטוריה. התחל סרטון מדף הצפייה והוא יופיע כאן.
            </p>
          ) : (
            <ul className="mt-8 divide-y divide-[#FAFAF8]/10 border border-[#FAFAF8]/10">
              {history.map((item) => {
                const thumb =
                  item.thumbnail_url ??
                  `https://i.ytimg.com/vi/${item.youtube_id}/hqdefault.jpg`;
                return (
                  <li key={item.youtube_id}>
                    <Link
                      href={`/watch/${item.youtube_id}`}
                      className="flex gap-4 p-4 text-[#FAFAF8] no-underline transition hover:bg-[#141519] hover:no-underline sm:gap-5 sm:p-5"
                    >
                      <div className="relative h-16 w-28 shrink-0 overflow-hidden bg-[#0A0A0B] sm:h-20 sm:w-36">
                        <Image
                          src={thumb}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="144px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold tracking-tight">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-[#9CA3AF]">
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
      </div>
    </main>
  );
}
