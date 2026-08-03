"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteClubMember, mintClubFeedToken, upsertClubMember } from "@/actions/club-login";
import { StudioCopyButton } from "@/components/studio/studio-copy-button";
import { maskClubPhone } from "@/lib/club/phone";
import { buildLeadWhatsAppHref } from "@/lib/studio/lead-contact";
import {
  clubAccessGranted,
  clubLoginGuide,
  expiryReminder,
} from "@/lib/studio/whatsapp-templates";

export type ClubMemberRow = {
  phone: string;
  display_name: string;
  notes: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
};

export type ClubLoginEventRow = {
  id: string;
  phone: string;
  display_name: string | null;
  source: string;
  created_at: string;
};

type ClubMembersPanelProps = {
  members: ClubMemberRow[];
  recentLogins: ClubLoginEventRow[];
};

function formatWhen(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function ClubMembersPanel({
  members,
  recentLogins,
}: ClubMembersPanelProps) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [notes, setNotes] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedUrl, setFeedUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [lastSaved, setLastSaved] = useState<{
    name: string;
    phone: string;
  } | null>(null);

  return (
    <section
      className="scroll-mt-6 space-y-6 border border-zinc-700 bg-zinc-900/50 p-5 sm:p-6"
      dir="rtl"
    >
      <div>
        <h2 className="text-base font-semibold text-zinc-100">
          חברי מועדון (רשימה מורשית)
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          רק טלפון ברשימה יכול להיכנס עם הסיסמה המשותפת. אפשר גם להנפיק פיד
          פודקאסט פרטי לכל חבר להאזנה באפליקציות.
        </p>
      </div>

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setStatus(null);
          startTransition(async () => {
            const result = await upsertClubMember({
              phone,
              displayName,
              notes,
              expiresAt: expiresAt.trim() ? expiresAt.trim() : null,
            });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setLastSaved({
              name: displayName.trim() || "חבר/ת",
              phone: phone.trim(),
            });
            setStatus(result.message ?? "נשמר. העתק הודעת כניסה למטה.");
            setPhone("");
            setDisplayName("");
            setNotes("");
            setExpiresAt("");
            router.refresh();
          });
        }}
      >
        <div>
          <label className="block text-xs text-zinc-400" htmlFor="member-name">
            שם
          </label>
          <input
            id="member-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400" htmlFor="member-phone">
            טלפון
          </label>
          <input
            id="member-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            dir="ltr"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400" htmlFor="member-notes">
            הערה
          </label>
          <input
            id="member-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-40 rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400" htmlFor="member-expires">
            תפוגת גישה (אופציונלי)
          </label>
          <input
            id="member-expires"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="mt-1 rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            dir="ltr"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950"
        >
          שמור חבר
        </button>
      </form>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {status ? <p className="text-sm text-zinc-300">{status}</p> : null}

      {lastSaved ? (
        <div className="space-y-2 border border-zinc-600 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-400">
            הודעה מוכנה ל-{lastSaved.name} (הדרכה + יכולות. הוסף סיסמה ידנית אם
            צריך, או הנפק קישור ב&quot;קישורי כניסה&quot;).
          </p>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap font-sans text-xs text-zinc-400">
            {clubAccessGranted({
              name: lastSaved.name,
              includeBenefits: true,
            })}
          </pre>
          <div className="flex flex-wrap gap-2">
            <StudioCopyButton
              text={clubAccessGranted({
                name: lastSaved.name,
                includeBenefits: true,
              })}
              label="העתק הודעה מלאה"
              onCopied={() => setStatus("הודעה הועתקה.")}
            />
            <StudioCopyButton
              text={clubLoginGuide({ name: lastSaved.name })}
              label="העתק הדרכה קצרה"
              onCopied={() => setStatus("הדרכה הועתקה.")}
            />
            <a
              href={buildLeadWhatsAppHref(
                lastSaved.phone,
                clubAccessGranted({
                  name: lastSaved.name,
                  includeBenefits: true,
                }),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center border border-zinc-500 px-3 text-xs text-zinc-100"
            >
              פתח וואטסאפ
            </a>
          </div>
        </div>
      ) : null}

      {feedUrl ? (
        <div className="rounded border border-zinc-600 bg-zinc-950 p-3">
          <p className="text-xs text-zinc-400">
            פיד פודקאסט פרטי (העתיקו עכשיו. לא יישמר כטקסט גלוי אחרי רענון):
          </p>
          <p className="mt-2 break-all font-mono text-xs text-zinc-100" dir="ltr">
            {feedUrl}
          </p>
          <button
            type="button"
            className="mt-3 rounded border border-zinc-500 px-3 py-1.5 text-xs text-zinc-100"
            onClick={() => {
              void navigator.clipboard.writeText(feedUrl);
              setStatus("הקישור הועתק.");
            }}
          >
            העתק קישור
          </button>
        </div>
      ) : null}

      <div>
        <h3 className="text-sm font-medium text-zinc-200">רשימה</h3>
        <ul className="mt-3 space-y-2 text-xs text-zinc-400">
          {members.length === 0 ? (
            <li>אין חברים עדיין.</li>
          ) : (
            members.map((row) => {
              const expired =
                row.expires_at &&
                new Date(row.expires_at).getTime() < Date.now();
              return (
              <li
                key={row.phone}
                className={`flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 py-2 ${
                  expired ? "text-red-300" : ""
                }`}
              >
                <span>
                  <span className={expired ? "text-red-200" : "text-zinc-200"}>
                    {row.display_name || "-"}
                  </span>
                  {" · "}
                  <span dir="ltr">{row.phone}</span>
                  {" · last "}
                  {formatWhen(row.last_seen_at)}
                  {row.expires_at ? (
                    <>
                      {" · תפוגה "}
                      {formatWhen(row.expires_at)}
                      {expired ? " (פג)" : ""}
                    </>
                  ) : null}
                  {row.notes ? ` · ${row.notes}` : ""}
                </span>
                <span className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded border border-zinc-600 px-2 py-1 text-zinc-200"
                    onClick={() => {
                      const text = row.expires_at
                        ? expiryReminder({
                            name: row.display_name || "חבר/ת",
                            expiresAt: row.expires_at,
                          })
                        : clubAccessGranted({
                            name: row.display_name || "חבר/ת",
                          });
                      void navigator.clipboard.writeText(text);
                      setStatus("הודעת וואטסאפ הועתקה.");
                    }}
                  >
                    העתק הודעת וואטסאפ
                  </button>
                  <button
                    type="button"
                    className="rounded border border-zinc-600 px-2 py-1 text-zinc-200"
                    disabled={pending}
                    onClick={() => {
                      setError(null);
                      setStatus(null);
                      setFeedUrl(null);
                      startTransition(async () => {
                        const result = await mintClubFeedToken({
                          phone: row.phone,
                          label: row.display_name || "",
                        });
                        if (!result.ok) {
                          setError(result.error);
                          return;
                        }
                        setFeedUrl(result.url);
                        setStatus(result.message ?? "פיד נוצר.");
                      });
                    }}
                  >
                    פיד פודקאסט
                  </button>
                  <button
                    type="button"
                    className="rounded border border-zinc-600 px-2 py-1 text-zinc-200"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        const result = await deleteClubMember(row.phone);
                        setStatus(
                          result.ok ? result.message ?? "הוסר." : result.error,
                        );
                        if (result.ok) router.refresh();
                      });
                    }}
                  >
                    הסר
                  </button>
                </span>
              </li>
              );
            })
          )}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-200">כניסות אחרונות</h3>
        <ul className="mt-3 space-y-2 text-xs text-zinc-400">
          {recentLogins.length === 0 ? (
            <li>אין עדיין.</li>
          ) : (
            recentLogins.map((row) => (
              <li
                key={row.id}
                className="border-b border-zinc-800 py-2"
              >
                {formatWhen(row.created_at)} ·{" "}
                {row.display_name || maskClubPhone(row.phone)} ·{" "}
                <span dir="ltr">{row.phone}</span> · {row.source}
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
