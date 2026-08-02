"use client";

import { useState, useTransition } from "react";

import {
  mintClubToken,
  revokeClubToken,
} from "@/actions/club-login";
import { clubAccessGranted } from "@/lib/studio/whatsapp-templates";

type TokenRow = {
  id: string;
  phone: string;
  expires_at: string;
  revoked_at: string | null;
  last_used_at: string | null;
  created_at: string;
};

type ClubTokenMintProps = {
  recentTokens: TokenRow[];
};

export function ClubTokenMint({ recentTokens }: ClubTokenMintProps) {
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [minutes, setMinutes] = useState(30);
  const [link, setLink] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section
      className="scroll-mt-6 space-y-6 border border-zinc-700 bg-zinc-900/50 p-5 sm:p-6"
      dir="rtl"
    >
      <div>
        <h2 className="text-base font-semibold text-zinc-100">
          הנפקת קישור מועדון
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          טלפון + שם (אופציונלי) + תוקף בדקות (ברירת מחדל 30). מעתיקים ושולחים
          בוואטסאפ. הקישור אישי. לא להעברה.
        </p>
      </div>

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setStatus(null);
          setLink(null);
          startTransition(async () => {
            const result = await mintClubToken({
              phone,
              minutesValid: minutes,
              displayName: displayName.trim() || undefined,
            });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setLink(result.url ?? null);
            setStatus(result.message ?? "נוצר קישור. העתיקו ושלחו בוואטסאפ.");
          });
        }}
      >
        <div>
          <label className="block text-xs text-zinc-400" htmlFor="mint-name">
            שם
          </label>
          <input
            id="mint-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400" htmlFor="mint-phone">
            טלפון
          </label>
          <input
            id="mint-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            dir="ltr"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400" htmlFor="mint-minutes">
            דקות
          </label>
          <input
            id="mint-minutes"
            type="number"
            min={5}
            max={1440}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value) || 30)}
            className="mt-1 w-24 rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950"
        >
          צור קישור
        </button>
      </form>

      {link ? (
        <div className="space-y-2 rounded-lg border border-zinc-600 bg-zinc-950 p-4 text-sm">
          <p className="break-all text-zinc-200" dir="ltr">
            {link}
          </p>
          <p className="whitespace-pre-wrap text-zinc-400">
            {clubAccessGranted({
              name: displayName.trim() || "חבר/ת",
              magicUrl: link,
            })}
          </p>
          <button
            type="button"
            className="rounded-md border border-zinc-500 px-3 py-1.5 text-xs text-zinc-100"
            onClick={() => {
              void navigator.clipboard.writeText(
                clubAccessGranted({
                  name: displayName.trim() || "חבר/ת",
                  magicUrl: link,
                }),
              );
              setStatus("הודעת וואטסאפ הועתקה.");
            }}
          >
            העתק הודעת וואטסאפ
          </button>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {status ? <p className="text-sm text-zinc-300">{status}</p> : null}

      <div>
        <h3 className="text-sm font-medium text-zinc-200">טוקנים אחרונים</h3>
        <ul className="mt-3 space-y-2 text-xs text-zinc-400">
          {recentTokens.length === 0 ? (
            <li>אין עדיין.</li>
          ) : (
            recentTokens.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 py-2"
              >
                <span dir="ltr">
                  {row.phone} · exp {new Date(row.expires_at).toLocaleString("he-IL")}
                  {row.revoked_at ? " · REVOKED" : ""}
                </span>
                {!row.revoked_at ? (
                  <button
                    type="button"
                    className="rounded border border-zinc-600 px-2 py-1 text-zinc-200"
                    onClick={() => {
                      startTransition(async () => {
                        const result = await revokeClubToken(row.id);
                        setStatus(
                          result.ok
                            ? result.message ?? "בוטל."
                            : result.error,
                        );
                      });
                    }}
                  >
                    Revoke
                  </button>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
