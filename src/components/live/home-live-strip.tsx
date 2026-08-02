import Link from "next/link";

import type { LivePublicStatus } from "@/lib/live/status";

type HomeLiveStripProps = {
  status: LivePublicStatus;
};

/**
 * Thin homepage strip for שידור חי מהאין.
 * Never includes the YouTube URL.
 */
export function HomeLiveStrip({ status }: HomeLiveStripProps) {
  if (status.isLive) {
    return (
      <aside
        aria-label="שידור חי מהאין"
        className="border-b border-foreground/10 bg-background text-foreground"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-2 px-4 py-4 text-center sm:px-6 sm:flex-row sm:justify-center sm:gap-4">
          <p className="text-sm font-medium text-action sm:text-base">
            שידור חי מהאין. עכשיו.
            {status.topic ? (
              <span className="font-normal text-foreground/70">
                {" "}
                · {status.topic}
              </span>
            ) : null}
          </p>
          <Link href="/live" className="link-arrow text-sm">
            לכניסה ←
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="שידור חי מהאין"
      className="border-b border-foreground/10 bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-3 text-center sm:px-6">
        <p className="text-sm text-foreground/60">
          שידור חי מהאין: פעם בשבוע, רק מתוך האתר.
        </p>
      </div>
    </aside>
  );
}
