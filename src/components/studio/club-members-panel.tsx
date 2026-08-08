"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  deleteClubMember,
  markClubOpsStage,
  mintClubFeedToken,
  upsertClubMember,
} from "@/actions/club-login";
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
  ops_link_minted_at: string | null;
  ops_whatsapp_sent_at: string | null;
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
  loadError?: string | null;
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
  loadError = null,
}: ClubMembersPanelProps) {
  const router = useRouter();
  const [rows, setRows] = useState(members);
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [notes, setNotes] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(loadError);
  const [feedUrl, setFeedUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [lastSaved, setLastSaved] = useState<{
    name: string;
    phone: string;
  } | null>(null);

  useEffect(() => {
    setRows(members);
  }, [members]);

  useEffect(() => {
    if (loadError) setError(loadError);
  }, [loadError]);

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
          רק טלפון ברשימה יכול להיכנס עם הסיסמה המשותפת. טלפון בפורמט
          05XXXXXXXX או 9725XXXXXXXX.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </p>
      ) : null}

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
            if (result.member) {
              setRows((prev) => {
                const without = prev.filter(
                  (m) => m.phone !== result.member!.phone,
                );
                return [result.member!, ...without];
              });
            }
            setLastSaved({
              name:
                displayName.trim() || result.member?.display_name || "חבר/ת",
              phone: result.phone || phone.trim(),
            });
            setStatus(result.message ?? "נשמר.");
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
            className="mt-1 border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            required
            minLength={2}
            placeholder="שם מלא"
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
            className="mt-1 border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            dir="ltr"
            required
            placeholder="05XXXXXXXX"
            inputMode="tel"
            autoComplete="tel"
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
            className="mt-1 w-40 border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </div>
        <div>
          <label
            className="block text-xs text-zinc-400"
            htmlFor="member-expires"
          >
            תפוגת גישה (אופציונלי)
          </label>
          <input
            id="member-expires"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="mt-1 border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            dir="ltr"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
        >
          {pending ? "שומר..." : "שמור חבר"}
        </button>
      </form>

      {status ? (
        <p className="text-sm text-emerald-300" role="status">
          {status}
        </p>
      ) : null}

      {lastSaved ? (
        <div className="space-y-2 border border-zinc-600 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-400">
            הודעה מוכנה ל-{lastSaved.name}. אפשר להוסיף סיסמה ידנית, או להנפיק
            קישור ב&quot;קישורי כניסה&quot;.
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
        <div className="border border-zinc-600 bg-zinc-950 p-3">
          <p className="text-xs text-zinc-400">
            פיד פודקאסט פרטי (העתיקו עכשיו):
          </p>
          <p
            className="mt-2 break-all font-mono text-xs text-zinc-100"
            dir="ltr"
          >
            {feedUrl}
          </p>
          <button
            type="button"
            className="mt-3 border border-zinc-500 px-3 py-1.5 text-xs text-zinc-100"
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
        <h3 className="text-sm font-medium text-zinc-200">
          רשימה ({rows.length})
        </h3>
        <ul className="mt-3 space-y-2 text-xs text-zinc-400">
          {rows.length === 0 ? (
            <li>אין חברים עדיין.</li>
          ) : (
            rows.map((row) => {
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
                    <span
                      className={expired ? "text-red-200" : "text-zinc-200"}
                    >
                      {row.display_name || "-"}
                    </span>
                    {", "}
                    <span dir="ltr">{row.phone}</span>
                    {", עודכן "}
                    {formatWhen(row.updated_at)}
                    {row.expires_at
                      ? `, תפוגה ${formatWhen(row.expires_at)}`
                      : ""}
                    {expired ? ", פג תוקף" : ""}
                    {row.ops_link_minted_at
                      ? `, קישור ${formatWhen(row.ops_link_minted_at)}`
                      : ""}
                    {row.ops_whatsapp_sent_at
                      ? `, וואטסאפ ${formatWhen(row.ops_whatsapp_sent_at)}`
                      : ""}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="border border-zinc-600 px-2 py-1 text-zinc-200"
                      onClick={() => {
                        startTransition(async () => {
                          const result = await markClubOpsStage({
                            phone: row.phone,
                            stage: "link_minted",
                          });
                          if (!result.ok) {
                            setError(result.error);
                            return;
                          }
                          setRows((prev) =>
                            prev.map((m) =>
                              m.phone === row.phone
                                ? {
                                    ...m,
                                    ops_link_minted_at: new Date().toISOString(),
                                  }
                                : m,
                            ),
                          );
                          setStatus(result.message ?? "סומן.");
                          router.refresh();
                        });
                      }}
                    >
                      קישור
                    </button>
                    <button
                      type="button"
                      className="border border-zinc-600 px-2 py-1 text-zinc-200"
                      onClick={() => {
                        startTransition(async () => {
                          const result = await markClubOpsStage({
                            phone: row.phone,
                            stage: "whatsapp_sent",
                          });
                          if (!result.ok) {
                            setError(result.error);
                            return;
                          }
                          setRows((prev) =>
                            prev.map((m) =>
                              m.phone === row.phone
                                ? {
                                    ...m,
                                    ops_whatsapp_sent_at: new Date().toISOString(),
                                  }
                                : m,
                            ),
                          );
                          setStatus(result.message ?? "סומן.");
                          router.refresh();
                        });
                      }}
                    >
                      וואטסאפ
                    </button>
                    <button
                      type="button"
                      className="border border-zinc-600 px-2 py-1 text-zinc-200"
                      onClick={() => {
                        startTransition(async () => {
                          const result = await mintClubFeedToken({
                            phone: row.phone,
                          });
                          if (!result.ok) {
                            setError(result.error);
                            return;
                          }
                          setFeedUrl(result.url ?? null);
                          setStatus(result.message ?? "נוצר פיד.");
                        });
                      }}
                    >
                      פיד
                    </button>
                    <StudioCopyButton
                      text={
                        row.expires_at
                          ? expiryReminder({
                              name: row.display_name || "חבר/ת",
                              expiresAt: row.expires_at,
                            })
                          : clubLoginGuide({
                              name: row.display_name || "חבר/ת",
                            })
                      }
                      label="העתק הודעה"
                      onCopied={() => setStatus("הודעה הועתקה.")}
                    />
                    <button
                      type="button"
                      className="border border-zinc-700 px-2 py-1 text-zinc-400"
                      onClick={() => {
                        if (!window.confirm(`להסיר את ${row.display_name}?`)) {
                          return;
                        }
                        startTransition(async () => {
                          const result = await deleteClubMember(row.phone);
                          if (!result.ok) {
                            setError(result.error);
                            return;
                          }
                          setRows((prev) =>
                            prev.filter((m) => m.phone !== row.phone),
                          );
                          setStatus(result.message ?? "הוסר.");
                          router.refresh();
                        });
                      }}
                    >
                      הסר
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-200">
          כניסות מועדון אחרונות
        </h3>
        <ul className="mt-3 space-y-1 text-xs text-zinc-500">
          {recentLogins.length === 0 ? (
            <li>אין עדיין.</li>
          ) : (
            recentLogins.map((row) => (
              <li key={row.id}>
                {formatWhen(row.created_at)}, {row.display_name || "-"},{" "}
                <span dir="ltr">{maskClubPhone(row.phone)}</span>, {row.source}
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
