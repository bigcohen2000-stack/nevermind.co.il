"use client";

import { useState, useTransition } from "react";

import { createClient } from "@/lib/supabase/client";

type AuthMode = "email" | "sms";

type MyListSignInFormProps = {
  nextPath?: string;
};

/**
 * Account sign-in: Google OAuth, email magic link, optional phone SMS OTP.
 *
 * Google + email are free. Phone OTP needs Supabase Phone provider + paid SMS.
 */
export function MyListSignInForm({ nextPath = "/my-list" }: MyListSignInFormProps) {
  const [mode, setMode] = useState<AuthMode>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

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
      const origin = window.location.origin;
      const { error: signError } = await supabase.auth.signInWithOAuth({
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
      }
    });
  }

  function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError("נא להזין אימייל.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const origin = window.location.origin;
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

      setMessage("נשלח קישור התחברות לאימייל. בדוק את תיבת הדואר.");
    });
  }

  function onSendSmsOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    const e164 = toE164(phone);
    if (!e164) {
      setError("נא להזין מספר טלפון תקין (למשל 05xxxxxxxx).");
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
      setMessage("נשלח קוד SMS. הזינו אותו למטה.");
    });
  }

  function onVerifySmsOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    const e164 = toE164(phone);
    const token = otp.trim();
    if (!e164 || !token) {
      setError("נא להזין מספר וקוד.");
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

  return (
    <div className="mt-8 space-y-4">
      <button
        type="button"
        onClick={onGoogleSignIn}
        disabled={pending}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-600 bg-zinc-950 px-4 text-sm font-semibold text-zinc-100 transition hover:border-zinc-400 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span aria-hidden="true" className="text-base">
          G
        </span>
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
          <div>
            <label htmlFor="my-list-email" className="block text-sm font-medium text-zinc-300">
              אימייל
            </label>
            <input
              id="my-list-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-red-500/70"
              placeholder="you@example.com"
              required
            />
          </div>

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
            <div>
              <label htmlFor="my-list-phone" className="block text-sm font-medium text-zinc-300">
                טלפון
              </label>
              <input
                id="my-list-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-red-500/70"
                placeholder="05xxxxxxxx"
                required
              />
            </div>

            {otpSent ? (
              <div>
                <label htmlFor="my-list-otp" className="block text-sm font-medium text-zinc-300">
                  קוד SMS
                </label>
                <input
                  id="my-list-otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-red-500/70"
                  placeholder="123456"
                  required
                />
              </div>
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
