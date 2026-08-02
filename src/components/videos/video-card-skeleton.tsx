export function VideoCardSkeleton() {
  return (
    <div className="h-full" aria-hidden="true">
      <div className="card flex h-full flex-col overflow-hidden">
        <div className="relative aspect-video w-full overflow-hidden border-b border-foreground/10 bg-paper">
          <div className="absolute inset-0 animate-pulse bg-foreground/10" />
        </div>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="h-5 w-4/5 animate-pulse rounded-sm bg-foreground/10" />
          <div className="mt-1.5 h-3 w-2/5 animate-pulse rounded-sm bg-foreground/10" />
        </div>
      </div>
    </div>
  );
}
