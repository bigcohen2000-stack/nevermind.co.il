import type { Metadata } from "next";
import Link from "next/link";

import {
  confirmMeetingByToken,
  getMeetingConfirmPreview,
} from "@/actions/studio-user-meeting";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ confirm?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "אישור פגישה | NeverMinde",
    robots: { index: false, follow: false },
  };
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("he-IL", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Jerusalem",
  });
}

export default async function ConfirmMeetingPage({
  params,
  searchParams,
}: PageProps) {
  const { token } = await params;
  const { confirm } = await searchParams;
  const shouldConfirm = confirm === "1";

  if (shouldConfirm) {
    const confirmed = await confirmMeetingByToken(token);
    return (
      <main
        className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col justify-center px-4 py-16"
        dir="rtl"
      >
        <p className="text-xs tracking-wide text-muted">NeverMinde</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          אישור פגישה
        </h1>
        {confirmed.ok ? (
          <div className="mt-6 space-y-3 border border-emerald-700/40 bg-emerald-50 p-5 dark:bg-emerald-950/30">
            <p className="text-lg font-medium text-emerald-800 dark:text-emerald-200">
              V אושר
            </p>
            <p className="text-sm text-foreground/85">
              {confirmed.message ?? "תודה."}
            </p>
            {confirmed.heldAt ? (
              <p className="text-sm text-muted">
                {formatWhen(confirmed.heldAt)}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-6 text-sm text-red-600" role="alert">
            {confirmed.error}
          </p>
        )}
        <p className="mt-10 text-xs text-muted">
          <Link href="/" className="underline-offset-2 hover:underline">
            חזרה לאתר
          </Link>
        </p>
      </main>
    );
  }

  const preview = await getMeetingConfirmPreview(token);

  return (
    <main
      className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col justify-center px-4 py-16"
      dir="rtl"
    >
      <p className="text-xs tracking-wide text-muted">NeverMinde</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        אישור פגישה
      </h1>

      {!preview.ok ? (
        <p className="mt-6 text-sm text-red-600" role="alert">
          {preview.error}
        </p>
      ) : preview.alreadyConfirmed ? (
        <div className="mt-6 space-y-3 border border-emerald-700/40 bg-emerald-50 p-5 dark:bg-emerald-950/30">
          <p className="text-lg font-medium text-emerald-800 dark:text-emerald-200">
            V כבר אושר
          </p>
          <p className="text-sm text-muted">{formatWhen(preview.heldAt)}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4 border border-foreground/15 bg-paper p-5">
          <p className="text-sm text-foreground">
            מועד שנרשם:{" "}
            <strong>{formatWhen(preview.heldAt)}</strong>
          </p>
          <p className="text-sm leading-relaxed text-muted">
            לחץ לאישור. זה רק סימון V, בלי תשלום ובלי כניסה לחשבון.
          </p>
          <Link
            href={`/m/${encodeURIComponent(token)}?confirm=1`}
            className="inline-flex min-h-11 items-center justify-center bg-action px-5 text-sm font-semibold text-white"
          >
            מאשר את הפגישה (V)
          </Link>
        </div>
      )}

      <p className="mt-10 text-xs text-muted">
        <Link href="/" className="underline-offset-2 hover:underline">
          חזרה לאתר
        </Link>
      </p>
    </main>
  );
}
