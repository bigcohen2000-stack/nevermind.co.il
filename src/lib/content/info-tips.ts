/**
 * Shared InfoTip copy for UI + FAQ/DefinedTerm JSON-LD (AEO).
 * Plain keyboard punctuation only.
 */

export const INFO_TIPS = {
  clubVideo: {
    label: "מה זה סרטון מועדון",
    text: "סרטון מהמאגר הסגור. הצפייה בו נפתחת לאחר כניסה למועדון.",
  },
  concepts: {
    label: "איך עובדים מושגים",
    text: "לחיצה על מושג מביאה אותך לרגע המדויק בסרטון שבו הוא מופיע.",
  },
  breakdown: {
    label: "מה זו רמת פירוק",
    text: "מדד המציג את עומק הניתוח בסרטון. מרמה 1 של יסודות ועד רמה 4 של פירוק גולמי.",
  },
  random: {
    label: "מה זו חקירה אקראית",
    text: "בחירת סרטון אחד מתוך המאגר הפתוח. לחיצה נוספת תבחר סרטון אחר.",
  },
} as const;

export type InfoTipKey = keyof typeof INFO_TIPS;

/** FAQPage JSON-LD from selected tip keys (server-safe). */
export function buildInfoTipsFaqLd(keys: readonly InfoTipKey[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: keys.map((key) => {
      const tip = INFO_TIPS[key];
      return {
        "@type": "Question",
        name: tip.label,
        acceptedAnswer: {
          "@type": "Answer",
          text: tip.text,
        },
      };
    }),
  };
}

/** DefinedTermSet JSON-LD from selected tip keys. */
export function buildInfoTipsDefinedTermLd(keys: readonly InfoTipKey[]) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "הסברים קצרים באתר NeverMind",
    hasDefinedTerm: keys.map((key) => {
      const tip = INFO_TIPS[key];
      return {
        "@type": "DefinedTerm",
        name: tip.label,
        description: tip.text,
      };
    }),
  };
}
