/**
 * Shared bottom FAB clearance for mobile floats (WhatsApp, a11y, etc.).
 * Bottom bars (beta / mobile CTA / watch nudge) publish their height into
 * --nm-fab-bar on <html>. Floats use --nm-fab-offset-bottom from globals.css.
 */

export type FabBarSource = "beta" | "cta" | "nudge";

const contributions: Partial<Record<FabBarSource, number>> = {};

export function setFabBarContribution(
  source: FabBarSource,
  heightPx: number,
): void {
  if (typeof document === "undefined") return;
  if (heightPx <= 0) {
    delete contributions[source];
  } else {
    contributions[source] = heightPx;
  }
  const values = Object.values(contributions);
  const max = values.length > 0 ? Math.max(...values) : 0;
  document.documentElement.style.setProperty("--nm-fab-bar", `${Math.round(max)}px`);
}

export function clearFabBarContribution(source: FabBarSource): void {
  setFabBarContribution(source, 0);
}
