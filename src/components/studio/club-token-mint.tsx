"use client";

import { useState, useTransition } from "react";

import {
  mintClubToken,
  revokeClubToken,
} from "@/actions/club-login";
import { StudioCopyButton } from "@/components/studio/studio-copy-button";
import { buildLeadWhatsAppHref } from "@/lib/studio/lead-contact";
import {
  clubAccessGranted,
  clubLoginGuide,
} from "@/lib/studio/whatsapp-templates";

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

  const waName = displayName.trim() || "חבר/ת";
  const fullMessage = link
    ? clubAccessGranted({
        name: waName,
        magicUrl: link,
        includeBenefits: true,
      })
    : "";
  const guideOnly = clubLoginGuide({ name: waName });

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
          טלפון + שם (אופציונלי) + תוקף בדקות (ברירת מחדל 30). נוצרת הודעת
          וואטסאפ עם קישור, הדרכה, ורשימת יכולות שנפתחו. מוכן להעתקה.
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
            setStatus(result.message ?? "נוצר קישור. העתק את הודעת הוואטסאפ.");
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
            className="mt-1 border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
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
            className="mt-1 border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
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
            className="mt-1 w-24 border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950"
        >
          צור קישור
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <StudioCopyButton
          text={guideOnly}
          label="העתק הדרכת כניסה (בלי קישור)"
          onCopied={() => setStatus("הדרכה הועתקה.")}
        />
      </div>

      {link ? (
        <div className="space-y-3 border border-zinc-600 bg-zinc-950 p-4 text-sm">
          <p className="break-all text-zinc-200" dir="ltr">
            {link}
          </p>
          <StudioCopyButton
            text={link}
            label="העתק קישור בלבד"
            onCopied={() => setStatus("קישור הועתק.")}
          />
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-sans text-xs text-zinc-400">
            {fullMessage}
          </pre>
          <div className="flex flex-wrap gap-2">
            <StudioCopyButton
              text={fullMessage}
              label="העתק הודעה מלאה לוואטסאפ"
              onCopied={() => setStatus("הודעת וואטסאפ הועתקה.")}
            />
            {phone.trim() ? (
              <a
                href={buildLeadWhatsAppHref(phone, fullMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center border border-zinc-500 px-3 text-xs text-zinc-100"
              >
                פתח וואטסאפ עם ההודעה
              </a>
            ) : null}
          </div>
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
                  {row.phone}, exp{" "}
                  {new Date(row.expires_at).toLocaleString("he-IL")}
                  {row.revoked_at ? ", בוטל" : ""}
                </span>
                {!row.revoked_at ? (
                  <button
                    type="button"
                    className="border border-zinc-600 px-2 py-1 text-zinc-200"
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
                    בטל
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
