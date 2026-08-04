import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { InstallAppButton } from "@/components/layout/install-app-button";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ברוך הבא",
  description: "החשבון מוכן. הצעדים הבאים באתר.",
  robots: { index: false, follow: false },
};

const STEPS = [
  {
    n: 1,
    title: "חשבון נוצר",
    body: "נרשמתם. אפשר לשמור סרטונים ולהמשיך מאיפה שעצרתם.",
    done: true,
  },
  {
    n: 2,
    title: "הרשימה שלי",
    body: "שומרים סרטונים להמשך, בלי לחפש שוב.",
    href: "/my-list",
    cta: "לרשימה",
  },
  {
    n: 3,
    title: "חיפוש וצפייה",
    body: "מחפשים מושג או סרטון, ונכנסים לחקירה.",
    href: "/search",
    cta: "לחיפוש",
  },
  {
    n: 4,
    title: "אפליקציה במסך הבית",
    body: "אופציונלי. גישה מהירה כמו אפליקציה, בלי חנות.",
    install: true,
  },
] as const;

/**
 * Post-registration landing. Clear next steps after Google / email signup.
 */
export default async function WelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/profile?mode=register");
  }

  const name =
    (typeof user.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name.trim()) ||
    (typeof user.user_metadata?.name === "string" &&
      user.user_metadata.name.trim()) ||
    user.email?.split("@")[0] ||
    null;

  return (
    <main className="min-h-full w-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-lg px-6 py-16 sm:py-20">
        <p className="text-xs font-medium tracking-wide text-action">
          שלב אחרי הרשמה
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {name ? `ברוך הבא, ${name}` : "ברוך הבא"}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-foreground/70">
          החשבון פעיל. זה לא עמוד התחברות נוסף. הנה מה שאפשר לעשות עכשיו, לפי
          סדר.
        </p>

        <ol className="mt-10 space-y-4">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="border border-foreground/15 bg-paper p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <span
                  className={
                    "flex size-8 shrink-0 items-center justify-center text-sm font-semibold " +
                    ("done" in step && step.done
                      ? "bg-action text-background"
                      : "border border-foreground/20 text-foreground")
                  }
                  aria-hidden="true"
                >
                  {step.n}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold tracking-tight">
                    {step.title}
                    {"done" in step && step.done ? (
                      <span className="ms-2 text-xs font-normal text-muted">
                        הושלם
                      </span>
                    ) : null}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/70">
                    {step.body}
                  </p>
                  {"href" in step && step.href ? (
                    <Link
                      href={step.href}
                      className="btn btn-secondary mt-3 inline-flex text-sm"
                    >
                      {step.cta}
                    </Link>
                  ) : null}
                  {"install" in step && step.install ? (
                    <div className="mt-3">
                      <InstallAppButton compact />
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-sm text-foreground/70">
          רוצים את מאגר המועדון המלא? זה מסלול נפרד ב{" "}
          <Link href="/members" className="text-action underline-offset-2 hover:underline">
            אזור המועדון
          </Link>
          .
        </p>
        <p className="mt-4">
          <Link href="/profile" className="text-sm text-muted underline-offset-2 hover:underline">
            לפרופיל
          </Link>
        </p>
      </div>
    </main>
  );
}
