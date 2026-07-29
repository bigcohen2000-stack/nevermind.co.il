/**
 * NeverMinde — Design Tokens
 *
 * Single source of truth for the color palette. The four brand colors are
 * locked; Polish v2 adds two supporting tones (ink, paper) plus warm neutrals
 * for layered editorial depth. Still minimal: no loud gradients, only soft
 * shadows. These mirror the CSS variables in src/app/globals.css — use the CSS
 * variables in components; use this file when a value is needed in TypeScript
 * (e.g. metadata themeColor, OG images).
 */

/** Locked brand palette (unchanged). */
export const colors = {
  /** Off-white page background. Calm, reduces eye fatigue. */
  background: "#FAFAF8",
  /** Deep black for body text and facts. Maximum contrast. */
  foreground: "#1A1A1A",
  /** Action red. Used sparingly for buttons and critical links. */
  action: "#D42B2B",
  /** Muted gray. The "story" / interpretation layer. */
  muted: "#9CA3AF",
} as const;

/** Polish v2 supporting tones (new). Depth only — never brand-defining. */
export const supportingColors = {
  /** Deep ink for premium dark bands (richer than pure black). */
  ink: "#141519",
  /** Lifted ink for cards/panels on dark bands. */
  inkRaised: "#1F2127",
  /** Warm off-white for light/light rhythm variation. */
  paper: "#F2EEE6",
} as const;

/** Semantic aliases — describe intent, not appearance. */
export const semanticColors = {
  pageBackground: colors.background,
  bodyText: colors.foreground,
  /** Objective reality. Rendered in pure black. */
  fact: colors.foreground,
  /** Subjective interpretation. Rendered muted. */
  story: colors.muted,
  /** Primary call to action. */
  actionPrimary: colors.action,
  secondaryText: colors.muted,
  /** Background of premium dark bands. */
  darkBand: supportingColors.ink,
  /** Warm surface for layered light sections. */
  warmSurface: supportingColors.paper,
} as const;

export type ColorToken = keyof typeof colors;
export type SupportingColorToken = keyof typeof supportingColors;
export type SemanticColorToken = keyof typeof semanticColors;
