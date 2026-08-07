"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { subscribeNewsletter } from "@/actions/newsletter";
import { ValidatedInput } from "@/components/forms/validated-field";
import { validateEmail } from "@/lib/forms/validators";
import { cn } from "@/lib/utils";

type NewsletterSignupProps = {
  /** Analytics / lead source tag. */
  source?: string;
  className?: string;
  tone?: "paper" | "dark";
};

/**
 * Email updates only. Not an account. Not club access.
 */
export function NewsletterSignup({
  source = "site",
  className,
  tone = "paper",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const isDark = tone === "dark";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowErrors(true);
    setError("");
    const fieldError = validateEmail(email, { required: true });
    if (fieldError) {
      setError(fieldError);
      return;
    }
    startTransition(async () => {
      const result = await subscribeNewsletter({ email, source });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
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
          <p
            className={cn(
              "mt-3 text-sm leading-relaxed sm:text-base",
              isDark ? "text-[#9CA3AF]" : "text-muted",
            )}
          >
            מאמרים חדשים וחקירות. בלי רעש. זה לא פותח חשבון או מועדון.
          </p>

          {done ? (
            <p className="mt-6 text-sm font-medium text-action">
              נרשמת לעדכון. נשלח כשיהיה מה לשלוח.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-3">
              <ValidatedInput
                label="אימייל"
                value={email}
                onChange={setEmail}
                validate={(v) => validateEmail(v, { required: true })}
                showErrors={showErrors}
                disabled={pending}
                tone={isDark ? "dark" : "light"}
                type="email"
                autoComplete="email"
                placeholder="האימייל שלך"
              />
              <button
                type="submit"
                disabled={pending}
                className="btn btn-primary min-h-11 w-full px-5 sm:w-auto"
              >
                {pending ? "שולח..." : "עדכון במייל"}
              </button>
            </form>
          )}

          {error ? (
            <p className="mt-3 text-sm text-action" role="alert">
              {error}
            </p>
          ) : null}

          <p
            className={cn(
              "mt-4 text-xs leading-relaxed",
              isDark ? "text-[#9CA3AF]" : "text-muted",
            )}
          >
            רוצים גם רשימה אישית?{" "}
            <Link
              href="/profile?mode=register"
              className="text-action underline-offset-2 hover:underline"
            >
              פתחו חשבון חינם
            </Link>
            . למאגר המלא:{" "}
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
