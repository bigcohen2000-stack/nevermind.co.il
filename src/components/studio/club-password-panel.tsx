"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { setClubSharedPassword } from "@/actions/club-login";
import { StudioOpsTipsPanel } from "@/components/studio/studio-ops-tips";
import { StudioCopyButton } from "@/components/studio/studio-copy-button";
import type { ClubPasswordStatus } from "@/lib/club/password-status";
import { clubAccessGranted } from "@/lib/studio/whatsapp-templates";

type ClubPasswordPanelProps = {
  status: ClubPasswordStatus;
};

function strengthLabel(password: string): { label: string; ok: boolean } {
  const len = password.trim().length;
  if (len === 0) return { label: "הזינו סיסמה", ok: false };
  if (len < 6) return { label: "קצרה מדי (מינימום 6)", ok: false };
  if (len < 10) return { label: "בסדר. אפשר לחזק עוד", ok: true };
  return { label: "חזקה מספיק", ok: true };
}

function suggestPassword(): string {
  const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) {
    out += alphabet[b % alphabet.length];
  }
  return out;
}

/**
 * Clear Studio UI to set / rotate the shared club password stored in club_config.
 */
export function ClubPasswordPanel({ status }: ClubPasswordPanelProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const strength = useMemo(() => strengthLabel(password), [password]);
  const match =
    confirm.length === 0
      ? null
      : password.trim() === confirm.trim()
        ? "תואם"
        : "לא תואם";

  const updatedLabel = status.updatedAt
    ? new Date(status.updatedAt).toLocaleString("he-IL", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  function onGenerate() {
    const next = suggestPassword();
    setPassword(next);
    setConfirm(next);
    setShow(true);
    setError(null);
    setMessage("נוצרה סיסמה. אפשר להעתיק ולשמור.");
  }

  function onCopy() {
    if (!password.trim()) return;
    void navigator.clipboard.writeText(password.trim()).then(() => {
      setMessage("הסיסמה הועתקה ללוח. שמרו אותה במקום בטוח.");
    });
  }

  return (
    <section
      className="scroll-mt-6 space-y-5 border border-amber-800/40 bg-amber-950/20 p-5 sm:p-6"
      dir="rtl"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">
            סיסמת מועדון משותפת
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
            זו הסיסמה שחברי המועדון מזינים יחד עם מספר הטלפון בעמוד הכניסה.
            נשמרת ב־Supabase בטבלת club_config. בלי Redeploy ב־Vercel.
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            status.isSet
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-zinc-700/60 text-zinc-300"
          }`}
        >
          {status.isSet ? "מוגדרת" : "עדיין לא הוגדרה"}
        </span>
      </div>

      <ol className="list-decimal space-y-1 pe-5 text-sm text-zinc-400">
        <li>בחרו סיסמה (או לחצו &quot;הצע סיסמה&quot;).</li>
        <li>אשרו אותה בשדה השני ולחצו &quot;שמור סיסמה&quot;.</li>
        <li>
          שלחו לחברים: היכנסו ל-
          <span className="text-zinc-200"> /members </span>
          עם טלפון + הסיסמה. אפשר להעתיק הודעה מוכנה אחרי שמירה.
        </li>
      </ol>

      <p className="text-xs text-zinc-500">
        גרסה {status.version}
        {updatedLabel ? `, עודכן ${updatedLabel}` : ""}. אחרי שמירה, עוגיות
        מועדון ישנות מתבטלות בכניסה הבאה.
      </p>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setMessage(null);
          const a = password.trim();
          const b = confirm.trim();
          if (a.length < 6) {
            setError("סיסמה קצרה מדי (מינימום 6 תווים).");
            return;
          }
          if (a !== b) {
            setError("הסיסמאות לא תואמות.");
            return;
          }
          startTransition(async () => {
            const result = await setClubSharedPassword(a);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setMessage(result.message ?? "נשמר.");
            setPassword("");
            setConfirm("");
            setShow(false);
            router.refresh();
          });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="club-shared-password"
              className="block text-xs text-zinc-400"
            >
              סיסמה חדשה
            </label>
            <input
              id="club-shared-password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="mt-1 w-full rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100"
              dir="ltr"
              placeholder="לפחות 6 תווים"
            />
            <p
              className={`mt-1 text-xs ${strength.ok ? "text-emerald-400" : "text-zinc-500"}`}
            >
              {strength.label}
            </p>
          </div>
          <div>
            <label
              htmlFor="club-shared-password-confirm"
              className="block text-xs text-zinc-400"
            >
              אימות סיסמה
            </label>
            <input
              id="club-shared-password-confirm"
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className="mt-1 w-full rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100"
              dir="ltr"
              placeholder="שוב אותה סיסמה"
            />
            {match ? (
              <p
                className={`mt-1 text-xs ${match === "תואם" ? "text-emerald-400" : "text-red-400"}`}
              >
                {match}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-zinc-600 px-3 py-2 text-xs text-zinc-200 hover:border-zinc-400"
            onClick={() => setShow((v) => !v)}
          >
            {show ? "הסתר" : "הצג"} סיסמה
          </button>
          <button
            type="button"
            className="rounded-md border border-zinc-600 px-3 py-2 text-xs text-zinc-200 hover:border-zinc-400"
            onClick={onGenerate}
          >
            הצע סיסמה
          </button>
          <button
            type="button"
            className="border border-zinc-600 px-3 py-2 text-xs text-zinc-200 hover:border-zinc-400 disabled:opacity-40"
            disabled={!password.trim()}
            onClick={onCopy}
          >
            העתק סיסמה
          </button>
          <StudioCopyButton
            text={clubAccessGranted({
              name: "",
              password: password.trim() || "___",
              includeBenefits: true,
            })}
            label="העתק הודעת כניסה+יכולות"
            disabled={!password.trim()}
            onCopied={() =>
              setMessage("הודעת וואטסאפ עם סיסמה ויכולות הועתקה.")
            }
          />
          <button
            type="submit"
            disabled={pending}
            className="bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
          >
            {pending ? "שומר..." : "שמור סיסמה"}
          </button>
        </div>
      </form>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

      <StudioOpsTipsPanel mode="password" />
    </section>
  );
}
