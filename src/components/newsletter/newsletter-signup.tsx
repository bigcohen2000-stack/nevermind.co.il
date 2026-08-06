"use client";

import { useState, useTransition } from "react";

import { subscribeNewsletter } from "@/actions/newsletter";
import { cn } from "@/lib/utils";

type NewsletterSignupProps = {
  /** Analytics / lead source tag. */
  source?: string;
  className?: string;
  tone?: "paper" | "dark";
};

/**
 * Dry email signup. Stores in Supabase and notifies admin via Resend.
 * No gradient, no hype copy.
 */
export function NewsletterSignup({
  source = "site",
  className,
  tone = "paper",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const isDark = tone === "dark";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
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
            עדכונים במייל
          </h2>
          <p
            className={cn(
              "mt-3 text-sm leading-relaxed sm:text-base",
              isDark ? "text-[#9CA3AF]" : "text-muted",
            )}
          >
            מאמרים חדשים וחקירות. בלי רעש.
          </p>

          {done ? (
            <p className="mt-6 text-sm font-medium text-action">
              נרשמת. נשלח כשיהיה מה לשלוח.
            </p>
          ) : (
            <form
              onSubmit={onSubmit}
              className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch"
            >
              <label className="sr-only" htmlFor="newsletter-email">
                אימייל
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="האימייל שלך"
                disabled={pending}
                className={cn(
                  "min-h-11 flex-1 border px-3 text-sm outline-none transition",
                  "focus-visible:ring-2 focus-visible:ring-action",
                  isDark
                    ? "border-[#FAFAF8]/25 bg-black/40 text-[#FAFAF8] placeholder:text-[#9CA3AF]"
                    : "border-foreground/20 bg-background text-foreground placeholder:text-muted",
                )}
              />
              <button
                type="submit"
                disabled={pending}
                className="btn btn-primary min-h-11 shrink-0 px-5"
              >
                {pending ? "שולח..." : "הרשמה"}
              </button>
            </form>
          )}

          {error ? (
            <p className="mt-3 text-sm text-action" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default NewsletterSignup;
