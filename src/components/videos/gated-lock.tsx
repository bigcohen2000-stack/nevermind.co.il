import Link from "next/link";

type GatedLockProps = {
  title: string;
};

export function GatedLock({ title }: GatedLockProps) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center border border-foreground/15 bg-ink px-6 text-center text-background">
      <p className="text-sm text-background/60">תוכן לחברים</p>
      <h2 className="mt-3 max-w-lg text-2xl font-semibold tracking-tight">
        תוכן זה פתוח לחברים רשומים בלבד
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-background/70">
        «{title}» זמין לאחר התחברות. מערכת ההתחברות תחובר בשלב הבא.
      </p>
      <Link href="/members" className="btn btn-primary mt-6">
        לאזור החברים
      </Link>
    </div>
  );
}
