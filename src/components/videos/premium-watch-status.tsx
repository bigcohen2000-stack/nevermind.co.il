import { InstallAppButton } from "@/components/layout/install-app-button";

type PremiumWatchStatusProps = {
  displayName: string | null;
  maskedPhone: string;
};

/**
 * Entitled / club watch identity: dark "member" strip + app install path.
 */
export function PremiumWatchStatus({
  displayName,
  maskedPhone,
}: PremiumWatchStatusProps) {
  const label = displayName?.trim() || null;
  const phoneHint =
    maskedPhone && maskedPhone !== "***" ? maskedPhone : null;
  const greeting = label
    ? `שלום, ${label}.`
    : phoneHint
      ? `צופה: ${phoneHint}.`
      : "הגישה שלך פתוחה.";

  return (
    <aside
      className="mt-6 border border-[#FAFAF8]/15 bg-[#0A0A0B] p-5 text-[#FAFAF8] sm:p-6"
      aria-label="סטטוס מועדון"
    >
      <p className="text-xs font-medium tracking-[0.14em] text-[#FAFAF8]/55">
        חבר מועדון
      </p>
      <p className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
        {greeting}
      </p>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-[#FAFAF8]/75">
        המאגר המלא פתוח במכשיר הזה. להתקנות, התראות וגישה מהירה: דרך האפליקציה.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <InstallAppButton className="border-[#FAFAF8]/25 bg-transparent text-[#FAFAF8] hover:border-action hover:text-action" />
        <p className="text-xs text-[#FAFAF8]/55">
          ניהול נוח מהמסך הראשי. לא מחליף כניסת מועדון.
        </p>
      </div>
    </aside>
  );
}
