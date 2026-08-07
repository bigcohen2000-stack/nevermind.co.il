export default function ProfileLoading() {
  return (
    <main className="min-h-full w-full bg-background px-6 py-16 text-foreground">
      <div className="mx-auto w-full max-w-lg space-y-4">
        <p className="text-sm text-muted">טוענים את הפרופיל...</p>
        <div className="h-8 w-2/3 border border-foreground/10 bg-paper" />
        <div className="h-24 border border-foreground/10 bg-paper" />
      </div>
    </main>
  );
}
