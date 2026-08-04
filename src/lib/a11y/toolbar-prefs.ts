/**
 * Client-side accessibility toolbar preferences.
 * Stored in localStorage and applied as data-* on <html>.
 */

export const A11Y_STORAGE_KEY = "nm_a11y_prefs";

export type A11yFontScale = "normal" | "large" | "xlarge";

/** Horizontal dock: start keeps clear of WhatsApp (end). */
export type A11yCorner = "start" | "end";

export type A11yPrefs = {
  fontScale: A11yFontScale;
  highContrast: boolean;
  underlineLinks: boolean;
  stopAnimations: boolean;
  relaxedSpacing: boolean;
  grayscale: boolean;
  /** Floating button dock. Default start (RTL: right). */
  corner: A11yCorner;
};

export const DEFAULT_A11Y_PREFS: A11yPrefs = {
  fontScale: "normal",
  highContrast: false,
  underlineLinks: false,
  stopAnimations: false,
  relaxedSpacing: false,
  grayscale: false,
  corner: "start",
};

export function parseA11yPrefs(raw: string | null): A11yPrefs {
  if (!raw) return { ...DEFAULT_A11Y_PREFS };
  try {
    const parsed = JSON.parse(raw) as Partial<A11yPrefs>;
    const fontScale =
      parsed.fontScale === "large" || parsed.fontScale === "xlarge"
        ? parsed.fontScale
        : "normal";
    const corner: A11yCorner =
      parsed.corner === "end" ? "end" : "start";
    return {
      fontScale,
      highContrast: Boolean(parsed.highContrast),
      underlineLinks: Boolean(parsed.underlineLinks),
      stopAnimations: Boolean(parsed.stopAnimations),
      relaxedSpacing: Boolean(parsed.relaxedSpacing),
      grayscale: Boolean(parsed.grayscale),
      corner,
    };
  } catch {
    return { ...DEFAULT_A11Y_PREFS };
  }
}

export function applyA11yPrefs(prefs: A11yPrefs, root: HTMLElement = document.documentElement) {
  root.dataset.a11yFont = prefs.fontScale;
  root.dataset.a11yContrast = prefs.highContrast ? "high" : "off";
  root.dataset.a11yLinks = prefs.underlineLinks ? "underline" : "off";
  root.dataset.a11yMotion = prefs.stopAnimations ? "reduce" : "off";
  root.dataset.a11ySpacing = prefs.relaxedSpacing ? "relaxed" : "off";
  root.dataset.a11yGrayscale = prefs.grayscale ? "on" : "off";
}

export function clearA11yAttrs(root: HTMLElement = document.documentElement) {
  delete root.dataset.a11yFont;
  delete root.dataset.a11yContrast;
  delete root.dataset.a11yLinks;
  delete root.dataset.a11yMotion;
  delete root.dataset.a11ySpacing;
  delete root.dataset.a11yGrayscale;
}

/** Inline bootstrap to avoid flash of unstyled prefs before React hydrates. */
export const A11Y_BOOTSTRAP_SCRIPT = `(function(){try{var r=localStorage.getItem(${JSON.stringify(A11Y_STORAGE_KEY)});if(!r)return;var p=JSON.parse(r);var h=document.documentElement;if(p.fontScale==="large"||p.fontScale==="xlarge")h.setAttribute("data-a11y-font",p.fontScale);if(p.highContrast)h.setAttribute("data-a11y-contrast","high");if(p.underlineLinks)h.setAttribute("data-a11y-links","underline");if(p.stopAnimations)h.setAttribute("data-a11y-motion","reduce");if(p.relaxedSpacing)h.setAttribute("data-a11y-spacing","relaxed");if(p.grayscale)h.setAttribute("data-a11y-grayscale","on");}catch(e){}})();`;
