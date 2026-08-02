import type { Metadata } from "next";
import Link from "next/link";

import { MyListSignInForm } from "@/components/auth/my-list-sign-in-form";
import { VideoCard } from "@/components/videos/video-card";
import { listSavedVideos } from "@/actions/saved-videos";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "הרשימה שלי",
  description: "סרטונים ששמרת לצפייה מאוחר יותר.",
  robots: { index: false, follow: false },
};

export default async function MyListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-full w-full bg-zinc-950 text-zinc-100">
        <div className="mx-auto flex w-full max-w-lg flex-col px-6 py-16 sm:py-24">
          <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
            My List
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            התחבר כדי לראות את הרשימה
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            שמירת סרטונים מקושרת לחשבון. אפשר קישור חד-פעמי לאימייל, או
            התחברות באמצעות SMS רגיל אם Phone Auth מופעל ב-Supabase.
          </p>
          <MyListSignInForm />
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

  const videos = await listSavedVideos();

  return (
    <main className="min-h-full w-full bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-24">
        <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
          My List
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 lg:text-5xl">
          הרשימה שלי
        </h1>
        <p className="mt-4 max-w-prose leading-relaxed text-zinc-400">
          סרטונים ששמרת לצפייה מאוחר יותר. אפשר להסיר בכל רגע עם סימן הסימניה.
        </p>

        <section className="mt-14" aria-labelledby="my-list-title">
          <h2
            id="my-list-title"
            className="text-xl font-semibold tracking-tight text-zinc-100"
          >
            {videos.length === 0
              ? "עדיין אין סרטונים שמורים"
              : `סרטונים שמורים (${videos.length})`}
          </h2>

          {videos.length === 0 ? (
            <div className="mt-8 space-y-3 text-zinc-400">
              <p>כשאתה לוחץ על הסימניה בכרטיס סרטון, הוא יופיע כאן.</p>
              <p className="text-sm">
                <Link
                  href="/videos"
                  className="text-zinc-200 underline-offset-2 hover:underline"
                >
                  לספריית הווידאו
                </Link>
              </p>
            </div>
          ) : (
            <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <li key={video.id}>
                  <VideoCard video={video} initialSaved tone="dark" />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
