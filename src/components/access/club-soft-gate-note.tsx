import Link from "next/link";

/**
 * Compact note when a search/concept hit needs club access.
 * No card chrome. One claim + one CTA.
 */
export function ClubSoftGateNote({
  className,
}: {
  className?: string;
}) {
  return (
    <p className={className ?? "mt-2 text-xs leading-relaxed text-muted"}>
      נפתח במועדון.{" "}
      <Link
        href="/members#access"
        className="text-action underline-offset-2 hover:underline"
      >
        בקשת גישה
      </Link>
    </p>
  );
}
