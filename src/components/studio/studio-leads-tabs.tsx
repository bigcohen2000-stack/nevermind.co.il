"use client";

import { useMemo, useState } from "react";

import { BookingLeadsDashboard } from "@/components/studio/booking-leads-dashboard";
import { PreMeetingLeadsDashboard } from "@/components/studio/pre-meeting-leads-dashboard";
import { SingleVideoLeadsDashboard } from "@/components/studio/single-video-leads-dashboard";
import type { BookingLeadsDashboardData } from "@/lib/studio/booking-leads";
import type { PreMeetingLeadsDashboardData } from "@/lib/studio/pre-meeting-leads";
import type { SingleVideoLeadsDashboardData } from "@/lib/studio/single-video-leads";

type LeadsTab = "contact" | "pre-meeting" | "single-video";

type StudioLeadsTabsProps = {
  booking: BookingLeadsDashboardData;
  preMeeting: PreMeetingLeadsDashboardData;
  singleVideo: SingleVideoLeadsDashboardData;
};

export function StudioLeadsTabs({
  booking,
  preMeeting,
  singleVideo,
}: StudioLeadsTabsProps) {
  const tabs = useMemo(
    () =>
      [
        {
          id: "contact" as const,
          label: "יצירת קשר",
          count: booking.openCount,
        },
        {
          id: "pre-meeting" as const,
          label: "לפני פגישה",
          count: preMeeting.openCount,
        },
        {
          id: "single-video" as const,
          label: "סרטון בודד",
          count: singleVideo.openCount,
        },
      ] as const,
    [booking.openCount, preMeeting.openCount, singleVideo.openCount],
  );

  const [tab, setTab] = useState<LeadsTab>("contact");

  return (
    <div className="space-y-8">
      <div
        className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4"
        role="tablist"
        aria-label="סוגי לידים"
      >
        {tabs.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`inline-flex min-h-11 items-center gap-2 border px-3 text-sm transition ${
                selected
                  ? "border-zinc-100 bg-zinc-100 text-zinc-950"
                  : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
              }`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
              <span
                className={`font-mono text-xs ${
                  selected ? "text-zinc-600" : "text-zinc-500"
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {tab === "contact" ? <BookingLeadsDashboard data={booking} /> : null}
        {tab === "pre-meeting" ? (
          <PreMeetingLeadsDashboard data={preMeeting} />
        ) : null}
        {tab === "single-video" ? (
          <SingleVideoLeadsDashboard data={singleVideo} />
        ) : null}
      </div>
    </div>
  );
}
