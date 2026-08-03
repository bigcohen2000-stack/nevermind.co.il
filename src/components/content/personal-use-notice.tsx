import { PERSONAL_USE_NOTICE } from "@/lib/content/access-layers";
import { cn } from "@/lib/utils";

type PersonalUseNoticeProps = {
  className?: string;
  /** Compact line under the player. */
  density?: "default" | "compact";
};

/**
 * Legal / personal-use terms for entitled watch and profile.
 */
export function PersonalUseNotice({
  className,
  density = "default",
}: PersonalUseNoticeProps) {
  if (density === "compact") {
    return (
      <p
        className={cn(
          "max-w-prose text-xs leading-relaxed text-muted",
          className,
        )}
      >
        {PERSONAL_USE_NOTICE.lines.join(" ")}
      </p>
    );
  }

  return (
    <aside
      aria-labelledby="personal-use-title"
      className={cn(
        "border border-foreground/15 bg-paper p-5 text-foreground sm:p-6",
        className,
      )}
    >
      <h2
        id="personal-use-title"
        className="text-base font-semibold tracking-tight"
      >
        {PERSONAL_USE_NOTICE.title}
      </h2>
      <ul className="mt-3 list-disc space-y-2 pe-5 text-sm leading-relaxed text-muted">
        {PERSONAL_USE_NOTICE.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </aside>
  );
}
