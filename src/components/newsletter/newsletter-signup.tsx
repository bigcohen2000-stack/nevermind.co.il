"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition, type RefObject } from "react";

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

function OutcomeBanner({
  ok,
  title,
  detail,
  tone,
  bannerRef,
}: {
  ok: boolean;
  title: string;
  detail?: string;
  tone: "paper" | "dark";
  bannerRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={bannerRef}
      tabIndex={-1}
      className={cn(
        "mt-4 border px-4 py-4 text-sm leading-relaxed sm:text-base",
        ok
          ? tone === "dark"
            ? "border-emerald-500/45 bg-emerald-500/10 text-emerald-100"
            : "border-emerald-800/40 bg-emerald-50 text-emerald-950"
          : tone === "dark"
            ? "border-[#D42B2B]/70 bg-[#D42B2B]/10 text-[#FF8A8A]"
            : "border-[#D42B2B] bg-[#D42B2B]/5 text-[#D42B2B]",
      )}
      role={ok ? "status" : "alert"}
      aria-live={ok ? "polite" : "assertive"}
    >
      <p className="font-semibold tracking-tight">
        {ok ? "הצלחה" : "שגיאה"}: {title}
      </p>
      {detail ? <p className="mt-1.5 text-[0.95em] opacity-90">{detail}</p> : null}
    </div>
  );
}

function scrollToBanner(ref: RefObject<HTMLDivElement | null>) {
  requestAnimationFrame(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    ref.current?.focus({ preventScroll: true });
  });
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
  const emailBannerRef = useRef<HTMLDivElement>(null);
  const phoneBannerRef = useRef<HTMLDivElement>(null);
  const isDark = tone === "dark";

  const muted = isDark ? "text-[#9CA3AF]" : "text-muted";
  const border = isDark ? "border-[#FAFAF8]/15" : "border-foreground/10";
  const panel = isDark ? "bg-[#0A0A0B] text-[#FAFAF8]" : "bg-white text-foreground";

  const emailLiveOk = useMemo(
    () => !validateEmail(email, { required: true }) && email.trim().length > 0,
    [email],
  );

  useEffect(() => {
    if (emailOutcome) scrollToBanner(emailBannerRef);
  }, [emailOutcome]);

  useEffect(() => {
    if (phoneOutcome) scrollToBanner(phoneBannerRef);
  }, [phoneOutcome]);

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
      try {
        const result = await subscribeNewsletter({ email, source });
        if (!result?.ok) {
          setEmailOutcome({
            kind: "error",
            code: result?.code ?? "save_failed",
            message:
              result?.error ??
              "ההרשמה לא נשמרה. נסו שוב בעוד רגע, או פנו בוואטסאפ.",
          });
          return;
        }
        setEmailOutcome({ kind: "saved", status: result.status });
      } catch {
        setEmailOutcome({
          kind: "error",
          code: "save_failed",
          message: "ההרשמה לא נשמרה. נסו שוב בעוד רגע, או פנו בוואטסאפ.",
        });
      }
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
      try {
        const result = await subscribeWhatsAppUpdates({ phone, source });
        if (!result?.ok) {
          setPhoneOutcome({
            kind: "error",
            code: result?.code ?? "save_failed",
            message:
              result?.error ??
              "ההרשמה לא נשמרה. נסו שוב בעוד רגע, או פנו בוואטסאפ.",
          });
          return;
        }
        setPhoneOutcome({
          kind: "saved",
          maskedPhone: result.maskedPhone,
          status: result.status,
        });
      } catch {
        setPhoneOutcome({
          kind: "error",
          code: "save_failed",
          message: "ההרשמה לא נשמרה. נסו שוב בעוד רגע, או פנו בוואטסאפ.",
        });
      }
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
            <OutcomeBanner
              bannerRef={emailBannerRef}
              ok
              tone={tone}
              title={
                emailOutcome.status === "reactivated"
                  ? "האימייל נשמר מחדש במערכת"
                  : "האימייל נשמר במערכת"
              }
              detail="אם הגדרתם Resend, תקבלו אישור למייל. אפשר לבטל בכל עת מהקישור שם."
            />
          ) : null}

          {emailOutcome?.kind === "error" ? (
            <OutcomeBanner
              bannerRef={emailBannerRef}
              ok={false}
              tone={tone}
              title={emailOutcome.message}
            />
          ) : null}

          {!emailOutcome && emailLiveOk ? (
            <p
              className={cn(
                "mt-3 text-xs",
                isDark ? "text-emerald-300/90" : "text-emerald-800",
              )}
            >
              הפורמט תקין. לחצו לשמירה במערכת.
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
                ref={phoneBannerRef}
                tabIndex={-1}
                className={cn("mt-5 border p-4 sm:p-5", border, panel)}
                role="status"
                aria-live="polite"
              >
                <p className="text-[11px] font-medium tracking-[0.16em] text-action uppercase">
                  הצלחה
                </p>
                <p className="mt-2 text-base font-semibold tracking-tight">
                  אישור הרשמה למספר {phoneOutcome.maskedPhone}
                </p>
                <p className={cn("mt-2 text-sm leading-relaxed", muted)}>
                  המספר אומת ונשמר במערכת. הקישור למטה הוא אישור הרשמה אישי
                  למספר הזה. לא משתפים אותו הלאה.
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
              <OutcomeBanner
                bannerRef={phoneBannerRef}
                ok={false}
                tone={tone}
                title={phoneOutcome.message}
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
