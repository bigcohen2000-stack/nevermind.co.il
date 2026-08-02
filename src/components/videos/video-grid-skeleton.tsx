import { VideoCardSkeleton } from "@/components/videos/video-card-skeleton";

type VideoGridSkeletonProps = {
  count?: number;
  className?: string;
};

export function VideoGridSkeleton({
  count = 9,
  className,
}: VideoGridSkeletonProps) {
  const gridClassName = [
    "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ul
      role="status"
      aria-busy="true"
      aria-label="טוען סרטונים"
      className={gridClassName}
    >
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          {i === 0 ? <span className="sr-only">טוען...</span> : null}
          <VideoCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
