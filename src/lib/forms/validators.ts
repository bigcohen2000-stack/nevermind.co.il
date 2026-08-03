/**
 * Shared client-side form validators (Hebrew copy, plain punctuation).
 * Soft, clear guidance. Align with server Zod where it exists.
 */

export type ValidateResult = string | null;

export function validateName(value: string): ValidateResult {
  const v = value.trim();
  if (!v) return "חסר שם. כתבו איך לפנות אליכם.";
  if (v.length < 2) return "עוד קצת: לפחות 2 תווים בשם.";
  if (v.length > 120) return "השם ארוך מדי. קצרו אותו.";
  return null;
}

/** Optional name: empty OK, otherwise same rules. */
export function validateOptionalName(value: string): ValidateResult {
  if (!value.trim()) return null;
  return validateName(value);
}

/**
 * Israeli-friendly phone: 05xxxxxxxx, +972..., or international digits.
 * Requires at least 9 digits after stripping non-digits.
 */
export function validatePhone(value: string): ValidateResult {
  const raw = value.trim();
  if (!raw) return "חסר טלפון. לדוגמה: 05xxxxxxxx.";
  if (raw.length > 40) return "המספר ארוך מדי. בדקו שאין תווים מיותרים.";
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 9) {
    return "עוד לא שלם. לדוגמה: 05xxxxxxxx או +9725xxxxxxxx.";
  }
  if (digits.length > 15) return "המספר ארוך מדי. בדקו שוב.";
  return null;
}

export function validateOptionalPhone(value: string): ValidateResult {
  if (!value.trim()) return null;
  return validatePhone(value);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(
  value: string,
  opts: { required?: boolean } = {},
): ValidateResult {
  const v = value.trim();
  if (!v) {
    return opts.required
      ? "חסר אימייל. צריך אותו כדי לשלוח במייל."
      : null;
  }
  if (v.length > 200) return "האימייל ארוך מדי.";
  if (!EMAIL_RE.test(v)) {
    return "נראה לא תקין. בדקו שיש @ ונקודה, בלי רווחים.";
  }
  return null;
}

export function validatePurpose(
  value: string,
  opts: { min?: number; label?: string } = {},
): ValidateResult {
  const min = opts.min ?? 5;
  const label = opts.label ?? "מטרת הפנייה";
  const v = value.trim();
  if (!v) return `חסר: ${label}. מספיק משפט אחד ברור.`;
  if (v.length < min) {
    return `עוד קצת טקסט (${v.length}/${min}). משפט קצר מספיק.`;
  }
  if (v.length > 2000) return "ארוך מדי. קצרו למשפט או שניים.";
  return null;
}

export function validatePassword(
  value: string,
  opts: { min?: number } = {},
): ValidateResult {
  const min = opts.min ?? 4;
  const v = value;
  if (!v.trim()) return "חסרה סיסמה.";
  if (v.length < min) return `עוד קצת: לפחות ${min} תווים.`;
  return null;
}

export function validateRequiredText(
  value: string,
  emptyMessage: string,
  opts: { min?: number; max?: number } = {},
): ValidateResult {
  const min = opts.min ?? 1;
  const max = opts.max ?? 5000;
  const v = value.trim();
  if (!v) return emptyMessage;
  if (v.length < min) {
    return `עוד קצת טקסט (${v.length}/${min}).`;
  }
  if (v.length > max) return "הטקסט ארוך מדי. קצרו אותו.";
  return null;
}

export type FieldVisualStatus = "idle" | "valid" | "invalid";

/**
 * Visual status for field marks.
 * Optional empty fields stay idle until the user types something invalid.
 */
export function getFieldVisualStatus(
  value: string,
  error: ValidateResult,
  opts: {
    touched: boolean;
    showErrors: boolean;
    optional?: boolean;
  },
): FieldVisualStatus {
  const reveal = opts.touched || opts.showErrors;
  const empty = !value.trim();

  if (empty && opts.optional) {
    return "idle";
  }
  if (empty && !reveal) {
    return "idle";
  }
  if (error) {
    return reveal || !empty ? "invalid" : "idle";
  }
  if (!empty) {
    return "valid";
  }
  return reveal ? "invalid" : "idle";
}
