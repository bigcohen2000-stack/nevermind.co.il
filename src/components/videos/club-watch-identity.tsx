/**
 * Soft identity line under the player for club sessions.
 */
export function ClubWatchIdentity({
  displayName,
  maskedPhone,
}: {
  displayName: string | null;
  maskedPhone: string;
}) {
  const label = displayName?.trim() || maskedPhone;
  return (
    <p className="mt-3 text-xs text-muted" aria-label="זהות מועדון">
      צופה: {label}. הגישה אישית במכשיר הזה.
    </p>
  );
}
