"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { loginClubPassword, logoutClub } from "@/actions/club-login";
import { ValidatedInput } from "@/components/forms/validated-field";
import { ClubJoinDisclaimer } from "@/components/members/club-join-disclaimer";
import { RandomClubButton } from "@/components/members/random-club-button";
import { maskClubPhone } from "@/lib/club/phone";
import {
  validateName,
  validatePassword,
  validatePhone,
} from "@/lib/forms/validators";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const HELP_TEXT =
  "היי יקיר, עדיין אין לי סיסמה או קישור למועדון. אשמח לקבל גישה.";

const NON_TRANSFER =
  "הגישה אישית. הסיסמה והקישור אינם להעברה.";

const SESSION_NOTICE =
  "שמרו את האתר (nevermind.co.il), לא את קישור הכניסה החד-פעמי. קישור קסם נגמר אחרי כחצי שעה. הכניסה עצמה נשמרת במכשיר.";

type ClubLoginFormProps = {
  initialPhone?: string | null;
  alreadyIn?: boolean;
  /** Full members page vs compact gate on locked watch. */
  variant?: "page" | "gate";
  /** After success: refresh and optionally navigate. */
  nextPath?: string;
  className?: string;
};

export function ClubLoginForm({
  initialPhone = null,
  alreadyIn = false,
  variant = "page",
  nextPath = "/videos",
  className,
}: ClubLoginFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const compact = variant === "gate";

  if (alreadyIn) {
    const masked = maskClubPhone(initialPhone);
    return (
      <div
        id="login"
        className={cn(
          "scroll-mt-24",
          compact
            ? "rounded-md border border-foreground/15 bg-paper/30 p-4 text-start"
            : "rounded-lg border border-foreground/15 bg-paper/40 p-6",
          className,
        )}
      >
        <p className="text-sm text-foreground/80">
          הגישה למאגר פתוחה במכשיר הזה ({masked}). {NON_TRANSFER}
        </p>
        {!compact ? (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <RandomClubButton />
            <a href="/videos" className="btn btn-secondary text-sm">
              לכל הסרטונים
            </a>
          </div>
        ) : null}
        <form
          className="mt-4"
          action={() => {
            startTransition(async () => {
              await logoutClub();
            });
          }}
        >
          <button
            type="submit"
            className="btn btn-secondary text-sm"
            disabled={pending}
          >
            יציאה מהמועדון
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      id="login"
      className={cn("scroll-mt-24 text-start", className)}
    >
      {!compact ? (
        <>
          <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            כניסה למועדון
          </h2>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-foreground/80 sm:text-base">
            הגישה למאגר התכנים פתוחה לחברי המועדון. ממלאים שם, טלפון וסיסמה
            שקיבלתם בוואטסאפ, או לוחצים על הקישור האישי. {NON_TRANSFER}
          </p>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
            {SESSION_NOTICE}
          </p>
        </>
      ) : (
        <p className="text-xs leading-relaxed text-muted">
          {NON_TRANSFER} {SESSION_NOTICE}
        </p>
      )}

      <ClubJoinDisclaimer
        tone="light"
        compact={compact}
        className={compact ? "mt-0" : "mt-6 sm:mt-8"}
      />

      <form
        className={cn("space-y-4", compact ? "mt-4" : "mt-8 max-w-md")}
        onSubmit={(e) => {
          e.preventDefault();
          setShowErrors(true);
          setError(null);
          setMessage(null);
          if (!acceptedDisclaimer) {
            setError("נדרש לאשר את האזהרה לפני הכניסה.");
            return;
          }
          const nameErr = validateName(displayName);
          const phoneErr = validatePhone(phone);
          const passErr = validatePassword(password);
          if (nameErr || phoneErr || passErr) {
            setError(nameErr || phoneErr || passErr);
            return;
          }
          startTransition(async () => {
            const result = await loginClubPassword({
              phone,
              password,
              displayName,
            });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setMessage(
              result.message ??
                `הגישה למאגר פתוחה במכשיר הזה. ${NON_TRANSFER}`,
            );
            router.refresh();
            if (nextPath) router.push(nextPath);
          });
        }}
      >
        <ValidatedInput
          label="שם מלא"
          value={displayName}
          onChange={setDisplayName}
          validate={validateName}
          showErrors={showErrors}
          autoComplete="name"
        />
        <ValidatedInput
          label="מספר טלפון"
          value={phone}
          onChange={setPhone}
          validate={validatePhone}
          showErrors={showErrors}
          type="tel"
          autoComplete="tel"
          dir="ltr"
          placeholder="05xxxxxxxx"
        />
        <ValidatedInput
          label="סיסמת מועדון"
          value={password}
          onChange={setPassword}
          validate={(v) => validatePassword(v)}
          showErrors={showErrors}
          type="password"
          autoComplete="current-password"
          dir="ltr"
        />

        <label
          className={cn(
            "flex items-start gap-3 leading-relaxed text-foreground/85",
            compact ? "text-xs" : "text-sm",
          )}
        >
          <input
            type="checkbox"
            checked={acceptedDisclaimer}
            onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
            required
            className="mt-1 size-4 shrink-0 accent-[var(--action)]"
          />
          <span>קראתי ואני מסכים/ה לאזהרה למעלה.</span>
        </label>

        {error ? (
          <p className="text-sm text-action" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="text-sm text-foreground/80" role="status">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={pending || !acceptedDisclaimer}
        >
          {pending ? "בודקים..." : "כניסה למאגר"}
        </button>
      </form>

      <p className={cn("text-sm text-muted", compact ? "mt-4" : "mt-6")}>
        עדיין אין לך סיסמה?{" "}
        <a
          href={buildWhatsAppHref(HELP_TEXT)}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-4 hover:underline"
        >
          פנייה בוואטסאפ לקבלת גישה
        </a>
      </p>
    </div>
  );
}
