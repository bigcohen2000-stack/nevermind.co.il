import Link from "next/link";

import type { LogicalContinuation } from "@/lib/videos/logical-continuation";
import { cn } from "@/lib/utils";

type LogicalContinuationLinkProps = {
  continuation: LogicalContinuation;
  className?: string;
};

/**
 * Single dry CTA: the next logical investigation step after a video.
 */
export function LogicalContinuationLink({
  continuation,
  className,
}: LogicalContinuationLinkProps) {
  const { nextTopic, rationale, href, videoTitle } = continuation;

  return (
    <section
      aria-labelledby="logical-continuation-title"
      className={cn(
        "border border-foreground/15 bg-background p-4 sm:p-5",
        className,
      )}
    >
      <p className="text-xs font-medium tracking-wide text-action">השלב הבא</p>
      <h2
        id="logical-continuation-title"
        className="mt-1 text-lg font-semibold tracking-tight sm:text-xl"
      >
        המשך החקירה הלוגית
      </h2>
      {rationale ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">{rationale}</p>
      ) : null}
      <Link
        href={href}
        className="mt-4 inline-flex min-h-11 items-center gap-2 border border-action bg-action px-4 text-sm font-medium text-background no-underline transition hover:bg-transparent hover:text-action hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
      >
        מעבר ל{nextTopic}
        <span aria-hidden="true">←</span>
      </Link>
      {videoTitle ? (
        <p className="mt-2 text-xs text-muted">{videoTitle}</p>
      ) : (
        <p className="mt-2 text-xs text-muted">חיפוש לפי המושג הבא בשרשרת.</p>
      )}
    </section>
  );
}
