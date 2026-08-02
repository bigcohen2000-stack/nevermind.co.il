"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { loginClubPassword, logoutClub } from "@/actions/club-login";
import { RandomClubButton } from "@/components/members/random-club-button";
import { buildWhatsAppHref } from "@/lib/whatsapp";

const HELP_TEXT =
  "היי יקיר, עדיין אין לי סיסמה או קישור למועדון. אשמח לקבל גישה.";

type ClubLoginFormProps = {
  initialPhone?: string | null;
  alreadyIn?: boolean;
};

export function ClubLoginForm({
  initialPhone = null,
  alreadyIn = false,
}: ClubLoginFormProps) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (alreadyIn) {
    const masked =
      initialPhone && initialPhone.length > 4
        ? `${initialPhone.slice(0, 3)}***${initialPhone.slice(-2)}`
        : "מחובר";
    return (
      <div
        id="login"
        className="scroll-mt-24 rounded-lg border border-foreground/15 bg-paper/40 p-6"
      >
        <p className="text-sm text-foreground/80">
          הגישה למאגר פתוחה במכשיר הזה ({masked}).
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <RandomClubButton />
          <a href="/videos" className="btn btn-secondary text-sm">
            לכל הסרטונים
          </a>
        </div>
        <form
          className="mt-6"
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
    <div id="login" className="scroll-mt-24">
      <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">
        כניסה למועדון
      </h2>
      <p className="mt-4 max-w-prose text-sm leading-relaxed text-foreground/80 sm:text-base">
        הגישה למאגר התכנים פתוחה לחברי המועדון. את הסיסמה או קישור הכניסה
        מקבלים ממני בוואטסאפ לאחר הסדרת הגישה. ממלאים טלפון וסיסמה, או לוחצים
        על הקישור, והתוכן פתוח.
      </p>

      <form
        className="mt-8 max-w-md space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setMessage(null);
          startTransition(async () => {
            const result = await loginClubPassword({ phone, password });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setMessage(result.message ?? "הגישה למאגר פתוחה במכשיר הזה.");
            router.refresh();
            router.push("/videos");
          });
        }}
      >
        <div>
          <label htmlFor="club-phone" className="block text-sm font-medium">
            מספר טלפון
          </label>
          <input
            id="club-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm"
            dir="ltr"
          />
        </div>
        <div>
          <label htmlFor="club-password" className="block text-sm font-medium">
            סיסמת מועדון
          </label>
          <input
            id="club-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm"
            dir="ltr"
          />
        </div>

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

        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "בודקים..." : "כניסה למאגר"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
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
