import Link from "next/link";

import { listConceptsWithVideoCounts } from "@/lib/videos/queries";

type SmartEmptyStateProps = {
  /** Context line above the concept links. */
  message: string;
  /** Optional dark tone for /my-list. */
  tone?: "light" | "dark";
};

/**
 * Empty search / favorites: show 4 most-linked concepts + live exploration link.
 */
export async function SmartEmptyState({
  message,
  tone = "light",
}: SmartEmptyStateProps) {
  const concepts = await listConceptsWithVideoCounts().catch(() => []);
  const top = concepts.slice(0, 4);
  const isDark = tone === "dark";

  return (
    <div
      className={
        isDark
          ? "mt-8 border border-dashed border-zinc-700 bg-zinc-900/30 p-6"
          : "mt-8 space-y-4"
      }
    >
      <p
        className={
          isDark
            ? "text-sm leading-relaxed text-zinc-400"
            : "text-foreground/70"
        }
      >
        {message}
      </p>

      {top.length > 0 ? (
        <div className="mt-4">
          <p
            className={
              isDark
                ? "text-xs text-zinc-500"
                : "text-xs text-muted"
            }
          >
            מושגי ליבה נצפים במאגר:
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {top.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/search?q=${encodeURIComponent(c.name)}`}
                  className={
                    isDark
                      ? "border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 hover:border-action hover:text-action"
                      : "border border-foreground/15 px-3 py-1.5 text-sm hover:border-action hover:text-action"
                  }
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className={isDark ? "mt-4 text-sm text-zinc-400" : "text-sm text-muted"}>
        <Link
          href="/live"
          className={
            isDark
              ? "text-zinc-200 underline-offset-2 hover:underline"
              : "text-action underline-offset-2 hover:underline"
          }
        >
          לחקירה פעילה בשידור החי
        </Link>
        {", "}
        <Link
          href="/concepts"
          className={
            isDark
              ? "text-zinc-200 underline-offset-2 hover:underline"
              : "text-action underline-offset-2 hover:underline"
          }
        >
          מדריך המושגים
        </Link>
      </p>
    </div>
  );
}
