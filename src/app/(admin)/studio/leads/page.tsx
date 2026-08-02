import Link from "next/link";

import { PreMeetingLeadsDashboard } from "@/components/studio/pre-meeting-leads-dashboard";
import { SingleVideoLeadsDashboard } from "@/components/studio/single-video-leads-dashboard";
import { StudioNav } from "@/components/studio/studio-nav";
import { StudioSessionRequired } from "@/components/studio/studio-session-required";
import { getPreMeetingLeadsDashboard } from "@/lib/studio/pre-meeting-leads";
import { getSingleVideoLeadsDashboard } from "@/lib/studio/single-video-leads";
import { isStudioAuthenticated } from "@/lib/studio/session";

export const dynamic = "force-dynamic";

export default async function StudioLeadsPage() {
  const unlocked = await isStudioAuthenticated();

  if (!unlocked) {
    return <StudioSessionRequired />;
  }

  const [preMeeting, singleVideo] = await Promise.all([
    getPreMeetingLeadsDashboard(),
    getSingleVideoLeadsDashboard(),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-16 px-6 py-12 sm:py-16">
      <header className="space-y-6">
        <StudioNav
          active="leads"
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
            לידים
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            בקשות סרטון בודד וטפסי פגישה לפני שיחה.
          </p>
        </div>
      </header>

      <SingleVideoLeadsDashboard data={singleVideo} />
      <PreMeetingLeadsDashboard data={preMeeting} />
    </main>
  );
}
