/**
 * Pure helpers for newsletter subscribe outcomes (unit-tested).
 */

export type NewsletterSaveOutcome =
  | { kind: "inserted" }
  | { kind: "already_active" }
  | { kind: "reactivated" }
  | { kind: "failed"; reason: string };

export function resolveSubscribeOutcome(input: {
  inserted: boolean;
  duplicate: boolean;
  wasUnsubscribed: boolean;
  dbError: string | null;
}): NewsletterSaveOutcome {
  if (input.inserted) return { kind: "inserted" };
  if (input.duplicate && input.wasUnsubscribed) return { kind: "reactivated" };
  if (input.duplicate && !input.wasUnsubscribed) return { kind: "already_active" };
  return {
    kind: "failed",
    reason: input.dbError || "save_failed",
  };
}

export function subscribeOutcomeIsSuccess(
  outcome: NewsletterSaveOutcome,
): boolean {
  return (
    outcome.kind === "inserted" ||
    outcome.kind === "already_active" ||
    outcome.kind === "reactivated"
  );
}
