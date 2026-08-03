"use client";

import { useMemo, useState } from "react";

import { StudioCopyButton } from "@/components/studio/studio-copy-button";
import { PATH_OFFERS } from "@/lib/content/offers";
import {
  downloadMeetingIcs,
  openMeetingInvitePrint,
} from "@/lib/studio/meeting-invite";
import { buildLeadWhatsAppHref } from "@/lib/studio/lead-contact";
import {
  meetingReservationPayment,
  type MeetingInviteInput,
} from "@/lib/studio/whatsapp-templates";

const MEETING_TRACKS = PATH_OFFERS.filter(
  (p) => p.id === "oneoff" || p.id === "extended",
);

type LeadMeetingInviteToolsProps = {
  name: string;
  phone?: string | null;
  email?: string | null;
  /** Prefill from lead context when it mentions a track. */
  contextHint?: string | null;
};

function defaultStartsAtLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setMinutes(0, 0, 0);
  d.setHours(10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * From a lead card: pick price-list track, set datetime, copy payment WA, ICS, print PDF.
 */
export function LeadMeetingInviteTools({
  name,
  phone,
  email,
  contextHint,
}: LeadMeetingInviteToolsProps) {
  const initialTrack =
    MEETING_TRACKS.find((t) =>
      (contextHint ?? "").includes(t.inquiryTrack ?? t.title),
    ) ?? MEETING_TRACKS[0];

  const [trackId, setTrackId] = useState(initialTrack?.id ?? "oneoff");
  const [startsAt, setStartsAt] = useState(defaultStartsAtLocal);
  const [locationNote, setLocationNote] = useState("זום / פרונטלי בתיאום");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [notes, setNotes] = useState("");
  const [hint, setHint] = useState<string | null>(null);

  const track = useMemo(
    () => MEETING_TRACKS.find((t) => t.id === trackId) ?? MEETING_TRACKS[0],
    [trackId],
  );

  const invite: MeetingInviteInput = useMemo(
    () => ({
      name: name.trim() || "לקוח",
      phone: phone?.trim() || undefined,
      email: email?.trim() || undefined,
      track: track?.inquiryTrack ?? track?.title ?? "פגישה",
      priceBeforeVat: track?.inquiryPriceBeforeVat ?? "",
      startsAt,
      durationMinutes: track?.id === "extended" ? 90 : 60,
      locationNote: locationNote.trim() || undefined,
      paymentDetails: paymentDetails.trim() || undefined,
      notes: notes.trim() || undefined,
    }),
    [
      name,
      phone,
      email,
      track,
      startsAt,
      locationNote,
      paymentDetails,
      notes,
    ],
  );

  const paymentText = meetingReservationPayment(invite);
  const waHref = phone?.trim()
    ? buildLeadWhatsAppHref(phone, paymentText)
    : null;

  return (
    <div className="mt-5 space-y-3 border-t border-zinc-800 pt-4">
      <h4 className="text-xs font-medium tracking-wide text-zinc-400">
        הזמנה + שיריון תשלום
      </h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-[10px] text-zinc-500">מסלול (מחירון)</label>
          <select
            className="mt-1 w-full min-h-10 border border-zinc-700 bg-zinc-950 px-2 text-sm text-zinc-100"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value as "oneoff" | "extended")}
          >
            {MEETING_TRACKS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} · {t.inquiryPriceBeforeVat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-zinc-500">תאריך ושעה</label>
          <input
            type="datetime-local"
            className="mt-1 w-full min-h-10 border border-zinc-700 bg-zinc-950 px-2 text-sm text-zinc-100"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-[10px] text-zinc-500">מיקום / אופן</label>
          <input
            className="mt-1 w-full min-h-10 border border-zinc-700 bg-zinc-950 px-2 text-sm text-zinc-100"
            value={locationNote}
            onChange={(e) => setLocationNote(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-[10px] text-zinc-500">
            פרטי תשלום (ביט / העברה / קישור)
          </label>
          <input
            className="mt-1 w-full min-h-10 border border-zinc-700 bg-zinc-950 px-2 text-sm text-zinc-100"
            value={paymentDetails}
            onChange={(e) => setPaymentDetails(e.target.value)}
            placeholder="אופציונלי. יופיע בהודעה ובהזמנה"
          />
        </div>
      </div>
      <div>
        <label className="block text-[10px] text-zinc-500">הערה פנימית להזמנה</label>
        <input
          className="mt-1 w-full min-h-10 border border-zinc-700 bg-zinc-950 px-2 text-sm text-zinc-100"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <StudioCopyButton
          text={paymentText}
          label="העתק הודעת שיריון"
          onCopied={() => setHint("הודעת תשלום לשיריון הועתקה.")}
        />
        {waHref ? (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center border border-zinc-600 px-3 text-xs text-zinc-200 hover:border-zinc-400"
          >
            שלח בוואטסאפ
          </a>
        ) : null}
        <button
          type="button"
          className="inline-flex min-h-10 items-center border border-zinc-600 px-3 text-xs text-zinc-200 hover:border-zinc-400"
          onClick={() => {
            openMeetingInvitePrint(invite);
            setHint("נפתח חלון הדפסה. בחר שמירה כ-PDF.");
          }}
        >
          PDF הזמנה
        </button>
        <button
          type="button"
          className="inline-flex min-h-10 items-center border border-zinc-600 px-3 text-xs text-zinc-200 hover:border-zinc-400"
          onClick={() => {
            downloadMeetingIcs(invite);
            setHint("קובץ יומן (.ics) הורד.");
          }}
        >
          יומן (.ics)
        </button>
      </div>
      {hint ? (
        <p className="text-xs text-zinc-400" role="status">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
