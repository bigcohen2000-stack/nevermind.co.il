import Link from "next/link";

import { getFeaturedInvestigatorComments } from "@/lib/videos/featured-comments";

type FeaturedInvestigatorsProps = {
  videoId: string;
  youtubeId?: string | null;
  watchHref?: string;
};

/**
 * Up to 3 heart-verified community questions under the player.
 */
export async function FeaturedInvestigators({
  videoId,
  youtubeId,
  watchHref,
}: FeaturedInvestigatorsProps) {
  const comments = await getFeaturedInvestigatorComments({
    videoId,
    youtubeId,
    limit: 3,
  });
  if (comments.length === 0) return null;

  return (
    <section
      className="mt-8 border border-foreground/15 bg-paper p-5 sm:p-6"
      aria-labelledby="featured-investigators-title"
    >
      <p
        id="featured-investigators-title"
        className="text-xs font-medium tracking-wide text-action"
      >
        שאלות שפתחו חקירה
      </p>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
        תגובות שסומנו ביוטיוב (לב או שרשור חוזר). עד שלוש ליד הסרטון.
      </p>
      <ul className="mt-5 space-y-4">
        {comments.map((comment) => {
          const localJump =
            watchHref &&
            comment.timestampSeconds != null &&
            comment.timestampSeconds > 0
              ? `${watchHref}?t=${comment.timestampSeconds}`
              : null;
          return (
            <li
              key={comment.id}
              className="border-b border-foreground/10 pb-4 last:border-0 last:pb-0"
            >
              <p className="text-sm leading-relaxed text-foreground">
                &quot;{comment.body}&quot;
              </p>
              {comment.authorName ? (
                <p className="mt-2 text-xs text-muted">
                  {comment.authorName}
                  {comment.commentedAt ? ` · ${comment.commentedAt}` : ""}
                </p>
              ) : null}
              <p className="mt-2 flex flex-wrap gap-3 text-xs">
                {localJump ? (
                  <Link
                    href={localJump}
                    className="text-action underline-offset-4 hover:underline"
                  >
                    לקפוץ לנקודה בסרטון
                  </Link>
                ) : null}
                {comment.youtubeUrl ? (
                  <a
                    href={comment.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted underline-offset-4 hover:underline"
                  >
                    לשרשור ביוטיוב
                  </a>
                ) : null}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
