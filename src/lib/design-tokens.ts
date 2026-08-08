/**
 * NeverMinde — Design Tokens
 *
 * Cream canvas (#FAFAF8) with dark bands (#121212 / #1A1A1A).
 * Action red and muted gray unchanged. Sharp geometry (radius 0, no shadow).
 * Mirrors CSS variables in src/app/globals.css.
 */

/** Brand palette (cream canvas). */
export const colors = {
  /** Off-white page background. */
  background: "#FAFAF8",
  /** Dark body text. */
  foreground: "#1A1A1A",
  /** Action red. Used sparingly for buttons and critical links. */
  action: "#D42B2B",
  /**
   * Muted gray for the "story" / interpretation layer on the cream canvas.
   * Darkened from #9CA3AF to keep text contrast >= 4.5:1; dark surfaces
   * still use onDark.muted (#9CA3AF).
   */
  muted: "#6B7280",
} as const;

/** Supporting tones for section rhythm. */
export const supportingColors = {
  /** Dark band / shell. */
  ink: "#121212",
  /** Raised dark surface. */
  inkRaised: "#1A1A1A",
  /** Light section surface (aligns with page canvas). */
  paper: "#FAFAF8",
} as const;

/** Light text on dark bands (OG cards, band-dark). */
export const onDark = {
  foreground: "#FAFAF8",
  muted: "#9CA3AF",
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
  /** Background of dark bands. */
  darkBand: supportingColors.ink,
  /** Raised surface for layered sections. */
  warmSurface: supportingColors.paper,
} as const;

export type ColorToken = keyof typeof colors;
export type SupportingColorToken = keyof typeof supportingColors;
export type SemanticColorToken = keyof typeof semanticColors;
