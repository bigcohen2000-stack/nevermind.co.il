"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { subscribeNewsletter } from "@/actions/newsletter";
import { subscribeWhatsAppUpdates } from "@/actions/whatsapp-updates";
import {
  ValidatedInput,
} from "@/components/forms/validated-field";
import {
  WHATSAPP_UPDATES_COMMUNITY_LABEL,
  WHATSAPP_UPDATES_COMMUNITY_URL,
} from "@/lib/content/whatsapp-updates";
import { validateEmail, validatePhone } from "@/lib/forms/validators";
import { cn } from "@/lib/utils";

type NewsletterSignupProps = {
  /** Analytics / lead source tag. */
  source?: string;
  className?: string;
  tone?: "paper" | "dark";
};

type EmailOutcome =
  | { kind: "saved"; status: "saved" | "reactivated" }
  | {
      kind: "error";
      code: "invalid" | "already_subscribed" | "rate_limited" | "save_failed";
      message: string;
    };

type PhoneOutcome =
  | { kind: "saved"; maskedPhone: string; status: "saved" | "reactivated" }
  | {
      kind: "error";
      code: "invalid" | "already_subscribed" | "rate_limited" | "save_failed";
      message: string;
    };

function Mark({
  ok,
  label,
  tone,
}: {
  ok: boolean;
  label: string;
  tone: "paper" | "dark";
}) {
  return (
    <p
      className={cn(
        "mt-4 flex items-start gap-2 border px-3 py-3 text-sm leading-relaxed",
        ok
          ? tone === "dark"
            ? "border-emerald-500/45 bg-emerald-500/10 text-emerald-200"
            : "border-emerald-700/35 bg-emerald-700/5 text-emerald-900"
          : tone === "dark"
            ? "border-[#D42B2B]/70 bg-[#D42B2B]/10 text-[#FF8A8A]"
            : "border-[#D42B2B] bg-[#D42B2B]/5 text-[#D42B2B]",
      )}
      role="status"
    >
      <span
        className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center border border-current text-xs font-semibold"
        aria-hidden
      >
        {ok ? "V" : "X"}
      </span>
      <span>{label}</span>
    </p>
  );
}

/**
 * Email updates + WhatsApp updates channel. Not an account. Not club access.
 */
export function NewsletterSignup({
  source = "site",
  className,
  tone = "paper",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showEmailErrors, setShowEmailErrors] = useState(false);
  const [showPhoneErrors, setShowPhoneErrors] = useState(false);
  const [emailOutcome, setEmailOutcome] = useState<EmailOutcome | null>(null);
  const [phoneOutcome, setPhoneOutcome] = useState<PhoneOutcome | null>(null);
  const [emailPending, startEmail] = useTransition();
  const [phonePending, startPhone] = useTransition();
  const isDark = tone === "dark";

  const muted = isDark ? "text-[#9CA3AF]" : "text-muted";
  const border = isDark ? "border-[#FAFAF8]/15" : "border-foreground/10";
  const panel = isDark ? "bg-[#0A0A0B] text-[#FAFAF8]" : "bg-white text-foreground";

  const emailLiveOk = useMemo(
    () => !validateEmail(email, { required: true }) && email.trim().length > 0,
    [email],
  );

  function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowEmailErrors(true);
    setEmailOutcome(null);
    const fieldError = validateEmail(email, { required: true });
    if (fieldError) {
      setEmailOutcome({
        kind: "error",
        code: "invalid",
        message: fieldError,
      });
      return;
    }
    startEmail(async () => {
      const result = await subscribeNewsletter({ email, source });
      if (!result.ok) {
        setEmailOutcome({
          kind: "error",
          code: result.code,
          message: result.error,
        });
        return;
      }
      setEmailOutcome({ kind: "saved", status: result.status });
    });
  }

  function onPhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowPhoneErrors(true);
    setPhoneOutcome(null);
    const fieldError = validatePhone(phone);
    if (fieldError) {
      setPhoneOutcome({
        kind: "error",
        code: "invalid",
        message: fieldError,
      });
      return;
    }
    startPhone(async () => {
      const result = await subscribeWhatsAppUpdates({ phone, source });
      if (!result.ok) {
        setPhoneOutcome({
          kind: "error",
          code: result.code,
          message: result.error,
        });
        return;
      }
      setPhoneOutcome({
        kind: "saved",
        maskedPhone: result.maskedPhone,
        status: result.status,
      });
    });
  }

  return (
    <section
      aria-labelledby="newsletter-title"
      className={cn(
        isDark
          ? "border-t border-[#FAFAF8]/15 bg-[#1A1A1A] text-[#FAFAF8]"
          : "border-t border-foreground/10 bg-paper text-foreground",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-xl text-start">
          <h2
            id="newsletter-title"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            עדכון במייל
          </h2>
          <p className={cn("mt-3 text-sm leading-relaxed sm:text-base", muted)}>
            מאמרים חדשים וחקירות. בלי רעש. זה לא פותח חשבון או מועדון.
          </p>

          <form onSubmit={onEmailSubmit} className="mt-6 space-y-3">
            <ValidatedInput
              label="אימייל"
              help="נבדוק שהכתובת תקינה לפני שמירה במערכת."
              value={email}
              onChange={(v) => {
                setEmail(v);
                if (emailOutcome) setEmailOutcome(null);
              }}
              validate={(v) => validateEmail(v, { required: true })}
              showErrors={showEmailErrors}
              disabled={emailPending || emailOutcome?.kind === "saved"}
              tone={isDark ? "dark" : "light"}
              type="email"
              autoComplete="email"
              placeholder="האימייל שלך"
            />
            <button
              type="submit"
              disabled={emailPending || emailOutcome?.kind === "saved"}
              className="btn btn-primary min-h-11 w-full px-5 sm:w-auto"
            >
              {emailPending
                ? "בודק ושומר..."
                : emailOutcome?.kind === "saved"
                  ? "נשמר"
                  : "עדכון במייל"}
            </button>
          </form>

          {emailOutcome?.kind === "saved" ? (
            <Mark
              ok
              tone={tone}
              label={
                emailOutcome.status === "reactivated"
                  ? "V נשמר מחדש במערכת. קיבלתם אישור למייל."
                  : "V האימייל תקין ונשמר במערכת. קיבלתם אישור למייל."
              }
            />
          ) : null}

          {emailOutcome?.kind === "error" ? (
            <Mark
              ok={false}
              tone={tone}
              label={
                emailOutcome.code === "already_subscribed"
                  ? `X ${emailOutcome.message}`
                  : emailOutcome.code === "invalid"
                    ? `X ${emailOutcome.message}`
                    : `X ${emailOutcome.message}`
              }
            />
          ) : null}

          {!emailOutcome && emailLiveOk ? (
            <p
              className={cn(
                "mt-3 text-xs",
                isDark ? "text-emerald-300/90" : "text-emerald-800",
              )}
            >
              V הפורמט תקין. לחצו לשמירה במערכת.
            </p>
          ) : null}

          <p className={cn("mt-4 text-xs leading-relaxed", muted)}>
            בלחיצה על &quot;עדכון במייל&quot; אתם מאשרים קבלת עדכונים לפי{" "}
            <Link
              href="/privacy"
              className="text-action underline-offset-2 hover:underline"
            >
              מדיניות הפרטיות
            </Link>
            . אפשר לבטל בכל עת דרך קישור במייל.
          </p>

          {/* WhatsApp updates channel */}
          <div className={cn("mt-10 border-t pt-8", border)}>
            <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
              ערוץ עדכונים בוואטסאפ
            </h3>
            <p className={cn("mt-2 text-sm leading-relaxed", muted)}>
              רוצים גם עדכונים קצרים בוואטסאפ הפנימי? מזינים מספר. אחרי אישור
              המערכת מקבלים קישור לערוץ.
            </p>

            {phoneOutcome?.kind === "saved" ? (
              <div
                className={cn("mt-5 border p-4 sm:p-5", border, panel)}
                role="status"
                aria-live="polite"
              >
                <p className="text-[11px] font-medium tracking-[0.16em] text-action uppercase">
                  עדכון מערכת
                </p>
                <p className="mt-2 text-sm font-semibold tracking-tight">
                  אישור הרשמה למספר {phoneOutcome.maskedPhone}
                </p>
                <p className={cn("mt-2 text-sm leading-relaxed", muted)}>
                  V המספר אומת ונשמר במערכת. הקישור למטה הוא אישור הרשמה
                  אישי למספר הזה. לא משתפים אותו הלאה.
                </p>

                <a
                  href={WHATSAPP_UPDATES_COMMUNITY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary mt-5 inline-flex min-h-11 w-full items-center justify-center px-4 text-sm sm:w-auto"
                >
                  {WHATSAPP_UPDATES_COMMUNITY_LABEL}
                </a>

                <div className={cn("mt-6 border-t pt-4", border)}>
                  <p className="text-sm font-medium">הטבת הצטרפות</p>
                  <p className={cn("mt-1.5 text-sm leading-relaxed", muted)}>
                    אפשר להמשיך לחקירה בתוכן פרימיום של המועדון: מאגר לא רשום,
                    חיפוש תמלילים מלא, ופיד פודקאסט פרטי. הכניסה אחרי בדיקת
                    התאמה.
                  </p>
                  <ul className={cn("mt-3 space-y-1.5 text-xs leading-relaxed", muted)}>
                    <li>
                      תנאי מועדון: גישה אישית, בלי שיתוף קישור, תשלום מחוץ
                      לאתר בוואטסאפ.
                    </li>
                    <li>
                      חשבון אתר חינם שומר רשימה והיסטוריה. הוא לא פותח את
                      מאגר המועדון לבד.
                    </li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/members#access"
                      className="btn btn-secondary min-h-10 px-4 text-xs"
                    >
                      תנאי מועדון ובקשת גישה
                    </Link>
                    <Link
                      href="/profile?mode=register"
                      className="btn btn-secondary min-h-10 px-4 text-xs"
                    >
                      הרשמה לאתר (חינם)
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={onPhoneSubmit} className="mt-5 space-y-3">
                <ValidatedInput
                  label="טלפון"
                  help="מספר ישראלי. לדוגמה 05xxxxxxxx."
                  value={phone}
                  onChange={(v) => {
                    setPhone(v);
                    if (phoneOutcome) setPhoneOutcome(null);
                  }}
                  validate={validatePhone}
                  showErrors={showPhoneErrors}
                  disabled={phonePending}
                  tone={isDark ? "dark" : "light"}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="05xxxxxxxx"
                />
                <button
                  type="submit"
                  disabled={phonePending}
                  className="btn btn-secondary min-h-11 w-full px-5 sm:w-auto"
                >
                  {phonePending ? "מאמת ושומר..." : "הרשמה לערוץ בוואטסאפ"}
                </button>
              </form>
            )}

            {phoneOutcome?.kind === "error" ? (
              <Mark
                ok={false}
                tone={tone}
                label={`X ${phoneOutcome.message}`}
              />
            ) : null}
          </div>

          <p className={cn("mt-8 text-xs leading-relaxed", muted)}>
            רוצים גם רשימה אישית?{" "}
            <Link
              href="/profile?mode=register"
              className="text-action underline-offset-2 hover:underline"
            >
              פתחו חשבון חינם
            </Link>
            . למאגר המלא ותנאי מועדון:{" "}
            <Link
              href="/members#access"
              className="text-action underline-offset-2 hover:underline"
            >
              בקשת גישה למועדון
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSignup;
