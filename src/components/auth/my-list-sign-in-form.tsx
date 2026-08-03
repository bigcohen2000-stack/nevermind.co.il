"use client";

import { useState, useTransition } from "react";

import { createClient } from "@/lib/supabase/client";
import {
  firstError,
  ValidatedInput,
} from "@/components/forms/validated-field";
import {
  validateEmail,
  validatePhone,
  validateRequiredText,
} from "@/lib/forms/validators";

type AuthMode = "email" | "sms";

type MyListSignInFormProps = {
  nextPath?: string;
  /** Compact: Google + email only (no SMS), for inline gates like transcript. */
  variant?: "full" | "compact";
  /** From /auth/callback failure redirect (?auth_error=...). */
  initialError?: string;
};

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4 shrink-0"
    >
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M5.3 14.3l-.8.6-2.5 1.9C3.5 20 7.5 22.8 12 22.8c2.7 0 5-.9 6.7-2.4l-3.1-2.4c-.9.6-2 .9-3.6.9-2.8 0-5.1-1.9-5.9-4.4z"
      />
      <path
        fill="#4A90E2"
        d="M2 7.2C1.4 8.4 1 9.7 1 11.2s.4 2.8 1 4l3.3-2.5c-.2-.6-.3-1.2-.3-1.5 0-.5.1-1 .3-1.5z"
      />
      <path
        fill="#FBBC05"
        d="M12 4.8c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 1.8 14.7 1 12 1 7.5 1 3.5 3.8 2 7.2l3.3 2.5C6.9 6.7 9.2 4.8 12 4.8z"
      />
    </svg>
  );
}

/**
 * Account sign-in: Google OAuth, email magic link, optional phone SMS OTP.
 *
 * Google + email are free. Phone OTP needs Supabase Phone provider + paid SMS.
 */
export function MyListSignInForm({
  nextPath = "/my-list",
  variant = "full",
  initialError = "",
}: MyListSignInFormProps) {
  const compact = variant === "compact";
  const [mode, setMode] = useState<AuthMode>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showErrors, setShowErrors] = useState(Boolean(initialError));
  const [message, setMessage] = useState("");
  const [error, setError] = useState(() =>
    initialError === "missing_code"
      ? "ההתחברות לא הושלמה. נסו שוב עם Google או אימייל."
      : initialError,
  );
  const [pending, startTransition] = useTransition();

  function authCallbackOrigin(): string {
    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    ).replace(/\/$/, "");
    if (
      window.location.hostname.endsWith("nevermind.co.il") ||
      window.location.hostname === "localhost"
    ) {
      return window.location.origin;
    }
    return siteUrl;
  }

  function toE164(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const digits = trimmed.replace(/[^\d+]/g, "");
    if (digits.startsWith("+") && digits.length >= 10) return digits;
    const only = digits.replace(/\D/g, "");
    if (only.startsWith("972") && only.length >= 11) return `+${only}`;
    if (only.startsWith("0") && only.length === 10) {
      return `+972${only.slice(1)}`;
    }
    if (only.length >= 9 && only.length <= 12) return `+${only}`;
    return null;
  }

  function onGoogleSignIn() {
    setError("");
    setMessage("");

    startTransition(async () => {
      const supabase = createClient();
      const origin = authCallbackOrigin();
      const { data, error: signError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (signError) {
        setError(signError.message);
        return;
      }

      if (data?.url) {
        setMessage("מעביר ל-Google...");
        window.location.assign(data.url);
      }
    });
  }

  function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowErrors(true);
    setError("");
    setMessage("");

    const err = validateEmail(email, { required: true });
    if (err) {
      setError(err);
      return;
    }

    const trimmed = email.trim();

    startTransition(async () => {
      const supabase = createClient();
      const origin = authCallbackOrigin();
      const { error: signError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });

      if (signError) {
        setError(signError.message);
        return;
      }

      setMessage("נשלח קישור התחברות לאימייל. בדקו את תיבת הדואר.");
    });
  }

  function onSendSmsOtp(e: React.FormEvent) {
    e.preventDefault();
    setShowErrors(true);
    setError("");
    setMessage("");

    const phoneErr = validatePhone(phone);
    if (phoneErr) {
      setError(phoneErr);
      return;
    }

    const e164 = toE164(phone);
    if (!e164) {
      setError("מספר טלפון לא תקין. לדוגמה: 05xxxxxxxx.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithOtp({
        phone: e164,
      });

      if (signError) {
        setError(
          "שליחת SMS נכשלה. התחברו עם Google או אימייל. SMS דורש ספק בתשלום ב-Supabase.",
        );
        setOtpSent(false);
        return;
      }

      setOtpSent(true);
      setShowErrors(false);
      setMessage("נשלח קוד SMS. הזינו אותו למטה.");
    });
  }

  function onVerifySmsOtp(e: React.FormEvent) {
    e.preventDefault();
    setShowErrors(true);
    setError("");
    setMessage("");

    const e164 = toE164(phone);
    const token = otp.trim();
    const err = firstError([
      () => validatePhone(phone),
      () =>
        validateRequiredText(otp, "נא להזין את קוד ה-SMS.", { min: 4 }),
    ]);
    if (err || !e164) {
      setError(err ?? "נא להזין מספר וקוד.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: e164,
        token,
        type: "sms",
      });

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      window.location.assign(nextPath);
    });
  }

  if (compact) {
    return (
      <div className="mt-4 max-w-md space-y-3">
        <button
          type="button"
          onClick={onGoogleSignIn}
          disabled={pending}
          className="btn btn-secondary inline-flex w-full items-center justify-center gap-2 text-sm"
        >
          <GoogleMark />
          {pending ? "מעביר ל-Google..." : "התחברות עם Google (חינם)"}
        </button>
        <form onSubmit={onEmailSubmit} className="space-y-3" noValidate>
          <ValidatedInput
            id="transcript-auth-email"
            label="אימייל"
            help="נשלח קישור התחברות לתיבה שלכם."
            value={email}
            onChange={setEmail}
            validate={(v) => validateEmail(v, { required: true })}
            showErrors={showErrors}
            type="email"
            autoComplete="email"
            dir="ltr"
            placeholder="you@example.com"
          />
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
          <button type="submit" disabled={pending} className="btn btn-primary w-full text-sm">
            {pending ? "שולח..." : "שלח קישור חינם לאימייל"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <button
        type="button"
        onClick={onGoogleSignIn}
        disabled={pending}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-600 bg-zinc-950 px-4 text-sm font-semibold text-zinc-100 transition hover:border-zinc-400 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleMark />
        {pending ? "מעביר ל-Google..." : "התחברות עם Google"}
      </button>

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-zinc-800" />
        <span className="text-xs text-zinc-500">או</span>
        <span className="h-px flex-1 bg-zinc-800" />
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="שיטת התחברות">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "email"}
          onClick={() => {
            setMode("email");
            setError("");
            setMessage("");
          }}
          className={
            mode === "email"
              ? "inline-flex min-h-10 items-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white"
              : "inline-flex min-h-10 items-center rounded-xl border border-zinc-700 px-4 text-sm font-medium text-zinc-300"
          }
        >
          אימייל
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "sms"}
          onClick={() => {
            setMode("sms");
            setError("");
            setMessage("");
          }}
          className={
            mode === "sms"
              ? "inline-flex min-h-10 items-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white"
              : "inline-flex min-h-10 items-center rounded-xl border border-zinc-700 px-4 text-sm font-medium text-zinc-300"
          }
        >
          SMS (בתשלום)
        </button>
      </div>

      {mode === "email" ? (
        <form onSubmit={onEmailSubmit} className="space-y-4" noValidate>
          <ValidatedInput
            id="my-list-email"
            label="אימייל"
            help="נשלח קישור התחברות. בדקו גם ספאם."
            value={email}
            onChange={setEmail}
            validate={(v) => validateEmail(v, { required: true })}
            showErrors={showErrors}
            tone="dark"
            type="email"
            autoComplete="email"
            dir="ltr"
            placeholder="you@example.com"
            inputClassName="rounded-xl border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 placeholder:text-zinc-600"
          />

          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="text-sm text-emerald-400" role="status">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "שולח..." : "שלח קישור התחברות"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-zinc-400">
            SMS דורש ספק בתשלום ב-Supabase (למשל Twilio). מומלץ Google או אימייל.
          </p>

          <form
            onSubmit={otpSent ? onVerifySmsOtp : onSendSmsOtp}
            className="space-y-4"
            noValidate
          >
            <ValidatedInput
              id="my-list-phone"
              label="טלפון"
              help="לדוגמה: 05xxxxxxxx."
              value={phone}
              onChange={setPhone}
              validate={validatePhone}
              showErrors={showErrors}
              tone="dark"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              dir="ltr"
              placeholder="05xxxxxxxx"
              inputClassName="rounded-xl border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 placeholder:text-zinc-600"
            />

            {otpSent ? (
              <ValidatedInput
                id="my-list-otp"
                label="קוד SMS"
                help="הקוד שנשלח למכשיר."
                value={otp}
                onChange={setOtp}
                validate={(v) =>
                  validateRequiredText(v, "נא להזין את קוד ה-SMS.", {
                    min: 4,
                  })
                }
                showErrors={showErrors}
                tone="dark"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                dir="ltr"
                placeholder="123456"
                inputClassName="rounded-xl border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 placeholder:text-zinc-600"
              />
            ) : null}

            {error ? (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="text-sm text-emerald-400" role="status">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending
                ? "שולח..."
                : otpSent
                  ? "אמת קוד והתחבר"
                  : "שלח קוד ב-SMS"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
