/**
 * NeverMinde — Design Tokens
 *
 * Dark-first palette. Pure black shell with light default text for contrast
 * against the site-wide Dot Background. Action red is unchanged. These mirror
 * the CSS variables in src/app/globals.css — use the CSS variables in
 * components; use this file when a value is needed in TypeScript
 * (e.g. metadata themeColor, OG images).
 */

/** Brand palette (dark shell). */
export const colors = {
  /** Pure black page background. */
  background: "#000000",
  /** Light body text. High contrast on black. */
  foreground: "#FAFAF8",
  /** Action red. Used sparingly for buttons and critical links. */
  action: "#D42B2B",
  /** Muted gray. The "story" / interpretation layer. */
  muted: "#9CA3AF",
} as const;

/** Supporting tones for section rhythm on the black shell. */
export const supportingColors = {
  /** Aligns with pure black page shell. */
  ink: "#000000",
  /** Lifted surface for cards/panels. */
  inkRaised: "#141519",
  /** Subtle section lift (replaces former cream paper). */
  paper: "#0A0A0B",
} as const;

/** Semantic aliases — describe intent, not appearance. */
export const semanticColors = {
  pageBackground: colors.background,
  bodyText: colors.foreground,
  /** Objective reality. */
  fact: colors.foreground,
  /** Subjective interpretation. Rendered muted. */
  story: colors.muted,
  /** Primary call to action. */
  actionPrimary: colors.action,
  secondaryText: colors.muted,
  /** Background of dark bands (transparent black so dots show). */
  darkBand: supportingColors.ink,
  /** Raised surface for layered sections. */
  warmSurface: supportingColors.paper,
} as const;

export type ColorToken = keyof typeof colors;
export type SupportingColorToken = keyof typeof supportingColors;
export type SemanticColorToken = keyof typeof semanticColors;
