"use client";

import { useEffect, useState, useTransition } from "react";

import { sendMagicLink } from "@/actions/auth-email";
import { ValidatedInput } from "@/components/forms/validated-field";
import { validateEmail } from "@/lib/forms/validators";

type MyListSignInFormProps = {
  nextPath?: string;
  /** Compact layout for inline gates (transcript, live, watch). */
  variant?: "full" | "compact";
  /** From /auth/callback failure redirect (?auth_error=...). */
  initialError?: string;
  /** Register copy + post-auth welcome path. */
  intent?: "login" | "register";
};

/**
 * Account sign-in via email magic link only (no Google / SMS).
 * Server Action enforces rate limits before calling Supabase Auth.
 */
export function MyListSignInForm({
  nextPath = "/my-list",
  variant = "full",
  initialError = "",
  intent = "login",
}: MyListSignInFormProps) {
  const compact = variant === "compact";
  const isRegister = intent === "register";
  const [email, setEmail] = useState("");
  const [showErrors, setShowErrors] = useState(Boolean(initialError));
  const [message, setMessage] = useState("");
  const [error, setError] = useState(() =>
    initialError === "missing_code"
      ? "ההתחברות לא הושלמה. בקשו קישור חדש לאימייל."
      : initialError,
  );
  const [pending, startTransition] = useTransition();
  const [cooldownSec, setCooldownSec] = useState(0);
  const coolingDown = cooldownSec > 0;

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const id = window.setTimeout(() => {
      setCooldownSec((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [cooldownSec]);

  function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending || coolingDown) return;

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
      const result = await sendMagicLink({
        email: trimmed,
        nextPath,
        intent,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage(result.message);
      setCooldownSec(30);
    });
  }

  const form = (
    <form onSubmit={onEmailSubmit} className="space-y-4" noValidate>
      <ValidatedInput
        id={compact ? "auth-email-compact" : "my-list-email"}
        label="אימייל"
        help={
          isRegister
            ? "נשלח קישור להשלמת הרשמה. בדקו גם ספאם."
            : "נשלח קישור התחברות. בדקו גם ספאם."
        }
        value={email}
        onChange={setEmail}
        validate={(v) => validateEmail(v, { required: true })}
        showErrors={showErrors}
        tone={compact ? "light" : "dark"}
        type="email"
        autoComplete="email"
        dir="ltr"
        placeholder="you@example.com"
        inputClassName={
          compact
            ? undefined
            : "border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 placeholder:text-zinc-600"
        }
      />

      {error ? (
        <p
          className={
            compact ? "text-sm text-action" : "text-sm text-red-400"
          }
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p
          className={
            compact
              ? "text-sm text-foreground/80"
              : "text-sm text-emerald-400"
          }
          role="status"
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || coolingDown}
        className="btn btn-primary w-full text-sm disabled:opacity-60"
      >
        {pending
          ? "שולח..."
          : coolingDown
            ? `נשלח. המתינו ${cooldownSec} שניות`
            : isRegister
              ? "שלח קישור להרשמה"
              : compact
                ? "שלח קישור חינם לאימייל"
                : "שלח קישור התחברות"}
      </button>
    </form>
  );

  if (compact) {
    return <div className="mt-4 max-w-md space-y-3">{form}</div>;
  }

  return (
    <div className="mt-8 space-y-4">
      {isRegister ? (
        <ol className="space-y-2 border border-zinc-800 bg-zinc-950/80 p-4 text-sm text-zinc-300">
          <li>
            <span className="font-semibold text-zinc-100">1.</span> הזינו אימייל
            ושלחו קישור (עכשיו)
          </li>
          <li>
            <span className="font-semibold text-zinc-100">2.</span> פתחו את
            הקישור מהמייל. אחרי האישור תעברו למסך &quot;ברוך הבא&quot;
          </li>
          <li>
            <span className="font-semibold text-zinc-100">3.</span> משם לרשימה
            ולחיפוש. מאגר המועדון נשאר שכבה נפרדת
          </li>
          <li>
            <span className="font-semibold text-zinc-100">4.</span> רוצים את
            המאגר המלא? בקשת גישה בדף המועדון
          </li>
        </ol>
      ) : null}

      {form}
    </div>
  );
}
