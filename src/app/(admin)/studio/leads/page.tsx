import { StudioLeadsTabs } from "@/components/studio/studio-leads-tabs";
import { StudioLockButton } from "@/components/studio/studio-lock-button";
import { StudioPageShell } from "@/components/studio/studio-page-shell";
import { StudioSessionRequired } from "@/components/studio/studio-session-required";
import { getBookingLeadsDashboard } from "@/lib/studio/booking-leads";
import { getPreMeetingLeadsDashboard } from "@/lib/studio/pre-meeting-leads";
import { getSingleVideoLeadsDashboard } from "@/lib/studio/single-video-leads";
import { isStudioAuthenticated } from "@/lib/studio/session";

export const dynamic = "force-dynamic";

export default async function StudioLeadsPage() {
  const unlocked = await isStudioAuthenticated();

  if (!unlocked) {
    return <StudioSessionRequired />;
  }

  const [booking, preMeeting, singleVideo] = await Promise.all([
    getBookingLeadsDashboard(),
    getPreMeetingLeadsDashboard(),
    getSingleVideoLeadsDashboard(),
  ]);

  const openTotal =
    booking.openCount + preMeeting.openCount + singleVideo.openCount;

  return (
    <StudioPageShell
      active="leads"
      title="לידים"
      description='יצירת קשר ותיאום, מפרק מחשבות, ובקשות סרטון בודד. הכל מנתוני אמת ב-Supabase. טבלת booking_leads דורשת מיגרציה 33.'
      actions={<StudioLockButton />}
      summary={
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          <span>
            פתוחים סה&quot;כ:{" "}
            <strong className="text-zinc-100">{openTotal}</strong>
          </span>
          <span>
            קשר:{" "}
            <strong className="text-zinc-100">{booking.openCount}</strong>
          </span>
          <span>
            לפני פגישה:{" "}
            <strong className="text-zinc-100">{preMeeting.openCount}</strong>
          </span>
          <span>
            סרטון:{" "}
            <strong className="text-zinc-100">{singleVideo.openCount}</strong>
          </span>
        </div>
      }
    >
      <StudioLeadsTabs
        booking={booking}
        preMeeting={preMeeting}
        singleVideo={singleVideo}
      />
    </StudioPageShell>
  );
}
