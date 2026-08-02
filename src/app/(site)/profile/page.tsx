import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { MyListSignInForm } from "@/components/auth/my-list-sign-in-form";
import { ClearWatchHistoryButton } from "@/components/profile/clear-watch-history-button";
import { SignOutButton } from "@/components/profile/sign-out-button";
import { listWatchHistory } from "@/actions/watch-history";
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

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-full w-full bg-[#000000] text-[#FAFAF8]">
        <div className="mx-auto flex w-full max-w-lg flex-col px-6 py-16 sm:py-24">
          <p className="text-xs font-medium tracking-[0.2em] text-[#9CA3AF] uppercase">
            Profile
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            התחבר לפרופיל
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#9CA3AF]">
            היסטוריית צפייה ופרטי חשבון זמינים אחרי התחברות. נשלח קישור לאימייל.
            בלי סיסמה.
          </p>
          <MyListSignInForm nextPath="/profile" />
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

  const history = await listWatchHistory(24);
  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString("he-IL", {
        dateStyle: "medium",
      })
    : null;

  return (
    <main className="min-h-full w-full bg-[#000000] text-[#FAFAF8]">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-24">
        <p className="text-xs font-medium tracking-[0.2em] text-[#9CA3AF] uppercase">
          Profile
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight lg:text-5xl">
          הפרופיל שלי
        </h1>
        <p className="mt-4 max-w-prose leading-relaxed text-[#9CA3AF]">
          פרטי חשבון והיסטוריית צפייה. בלי רעש.
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
                href="/my-list"
                className="border border-[#FAFAF8]/25 px-4 py-2 text-sm text-[#FAFAF8] transition hover:border-[#D42B2B] hover:text-[#D42B2B]"
              >
                הרשימה שלי
              </Link>
              <SignOutButton />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="watch-history-title"
          className="mt-14"
        >
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
