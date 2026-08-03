/**
 * Operational offers for NeverMind paths, archive pricing, and WhatsApp/SMS presets.
 * Prices are shown before VAT. Fit is confirmed on a call with Yakir. No checkout.
 */

export type PathId =
  | "oneoff"
  | "extended"
  | "podcast"
  | "library"
  | "unsure";

export interface PathOffer {
  id: PathId;
  title: string;
  body: string;
  tags: string[];
  ctaLabel: string;
  /** Prefill text for a direct WhatsApp / SMS CTA on this path. */
  whatsappText: string;
  /** Inquiry form: exact track line. Defaults to title. */
  inquiryTrack?: string;
  inquiryPriceBeforeVat?: string;
  inquiryDetail?: string;
  inquiryRequiresFitCall?: boolean;
  /** Optional external link (e.g. YouTube for podcast). */
  externalHref?: string;
  externalLabel?: string;
}

/** The only book currently acknowledged on the site. No ISBN, cover, or buy link yet. */
export interface BookInProgress {
  id: string;
  title: string;
  statusLabel: string;
  body: string;
  whatsappText: string;
}

export const BOOK_IN_PROGRESS: BookInProgress = {
  id: "love-20-pages",
  title: "אהבה ב-20 עמודים",
  statusLabel: "ספר, בכתיבה",
  body: "עדיין לא יצא. אין כאן קישור לרכישה, עטיפה או מספר ISBN. אם תרצו לדעת מתי זה זמין, אפשר לשאול בוואטסאפ.",
  whatsappText: "היי יקיר, מתי הספר אהבה ב-20 עמודים יהיה זמין?",
};

export interface ProcessStep {
  index: string;
  title: string;
  body: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** Legacy consulting row shape (kept for any older imports). Prefer ARCHIVE_PRICING_ROWS. */
export interface PricingRow {
  track: string;
  duration: string;
  price: string;
  description: string;
}

export interface ArchivePricingRow {
  id: string;
  frame: string;
  validity: string;
  /** Numeric ILS before VAT. Source of truth for discounted displays. */
  amountIls: number;
  /** Display string derived from amountIls. Keep in sync when editing rows. */
  price: string;
  analysis: string;
}

/** Default highlighted archive frame (שנתי). */
export const DEFAULT_ARCHIVE_PRICING_ID = "yearly";

export type CapacityState = "open" | "waitlist";

export type CapacityStatus = {
  state: CapacityState;
  /** Used only when state is waitlist. */
  waitWeeks: number;
};

/** Manual capacity signal. Edit here. No live calendar. */
export const CAPACITY_STATUS: CapacityStatus = {
  state: "open",
  waitWeeks: 0,
};

export const INTRO_CALL_PROTOCOL =
  "שיחת ההיכרות נמשכת כ-10 דקות. היא אינה שיחת ייעוץ. מטרתה הבלעדית היא בדיקת התאמה טכנית ולוגית לתהליך.";

export const NO_AUTO_CHECKOUT_NOTE =
  "הרשמה אוטומטית חסומה. אישור ידני נדרש כדי לסנן רכישות אימפולסיביות המונעות מרגש, ולוודא שהשיטה אכן תואמת את צורכי המשתמש.";

export const REFUND_POLICY_NOTE =
  "לאחר פתיחת הרשאת המשתמש למאגר הדיגיטלי, לא יינתן החזר כספי.";

export const RESPONSE_SLA_NOTE =
  "בדיקת ההתאמה ומתן המענה יתבצעו בתוך 24 שעות עסקים.";

export const ARCHIVE_TOOLS_NOTE =
  "המאגר כולל מנוע חיפוש פנימי לאיתור מושגים וטקסטים מתוך הסרטונים, מדדי חקירה, ופיד פודקאסט פרטי לחברים. המערכת מנטרת נתוני חיפוש כדי לדייק פיתוח תכנים עתידיים.";

export const VAT_FOOTER_NOTE =
  "כל המחירים אינם כוללים מע\"מ ויוספו כחוק בחשבונית.";

/** Dry syllabus of mechanisms present in the archive. No future promises. */
export const ARCHIVE_SYLLABUS: string[] = [
  "יחסים",
  "מציאות",
  "בחירה חופשית",
  "התמכרויות",
  "סמים",
  "תודעה",
];

export type TrackWhatsAppInput = {
  /** Exact track or authorization frame the visitor wants. */
  track: string;
  /** Price shown on site, before VAT (digits + currency as displayed). */
  priceBeforeVat?: string;
  /** When true, message states a fit conversation is required. Default true. */
  requiresFitCall?: boolean;
  /** Optional factual line (validity, duration, etc.). */
  detail?: string;
  /** Filled from the paths inquiry form when present. */
  name?: string;
  phone?: string;
  purpose?: string;
};

/**
 * Structured WhatsApp / SMS prefill: what they want, price frame, fit-check.
 * Not a vague "let's talk" opener.
 */
export function buildTrackWhatsAppText(input: TrackWhatsAppInput | string): string {
  const opts: TrackWhatsAppInput =
    typeof input === "string" ? { track: input } : input;
  const track = opts.track.trim();
  const requiresFitCall = opts.requiresFitCall !== false;
  const parts = ["היי יקיר.", `אני מבקש: ${track}.`];
  if (opts.detail?.trim()) {
    parts.push(opts.detail.trim());
  }
  if (opts.priceBeforeVat?.trim()) {
    parts.push(`מסגרת מחיר: ${opts.priceBeforeVat.trim()} לפני מע"מ.`);
  }
  if (requiresFitCall) {
    parts.push("נדרשת שיחת התאמה לפני אישור.");
  }
  parts.push(`שם מלא: ${opts.name?.trim() || "___"}.`);
  parts.push(`טלפון: ${opts.phone?.trim() || "___"}.`);
  parts.push(
    `מטרת הפנייה (משפט אחד): ${opts.purpose?.trim() || "___"}.`,
  );
  return parts.join(" ");
}

export function buildArchiveAccessWhatsAppText(
  frameName: string,
  priceBeforeVat?: string,
): string {
  const frame = frameName.trim();
  return buildTrackWhatsAppText({
    track: `הרשאת גישה למאגר הסרטונים, מסגרת ${frame}`,
    priceBeforeVat,
    requiresFitCall: true,
    detail: "אין סליקה אוטומטית באתר.",
  });
}

export function buildIntroCallWhatsAppText(): string {
  return buildTrackWhatsAppText({
    track: "שיחת היכרות לבדיקת התאמה בלבד",
    detail: "כ-10 דקות. אינה שיחת ייעוץ.",
    requiresFitCall: false,
  });
}

/** Paid open-mic guest seat in the weekly unlisted live. */
export const LIVE_OPEN_MIC = {
  id: "live-open-mic" as const,
  title: "אורח עם מיקרופון פתוח",
  body: "מקום בשידור החי השבועי. יושבים עם מיקרופון פתוח בחקירה ספונטנית. נדרשת שיחת התאמה לפני אישור.",
  priceBeforeVat: '980 ש"ח',
  tags: ["שידור חי", "מיקרופון פתוח", '980 ש"ח + מע"מ'],
  ctaLabel: "בקשת מקום עם מיקרופון",
  whatsappText: buildTrackWhatsAppText({
    track: "אורח עם מיקרופון פתוח בשידור חי מהאין",
    priceBeforeVat: '980 ש"ח',
    detail: "מקום בשיחה השבועית. מיקרופון פתוח.",
    requiresFitCall: true,
  }),
};

export function buildLiveOpenMicWhatsAppText(): string {
  return LIVE_OPEN_MIC.whatsappText;
}

export function getCapacityLabel(status: CapacityStatus = CAPACITY_STATUS): string {
  if (status.state === "waitlist") {
    const weeks = Math.max(1, status.waitWeeks);
    return `רשימת המתנה של ${weeks} שבועות`;
  }
  return "זמין";
}

export const PATH_OFFERS: PathOffer[] = [
  {
    id: "oneoff",
    title: "ייעוץ נקודתי (שעה)",
    body: "שיחה אחת של 60 דקות לפירוק סיטואציה ספציפית. נדרשת שיחת התאמה לפני תיאום.",
    tags: ["חד פעמי", "60 דקות", '750 ש"ח + מע"מ'],
    ctaLabel: "בקשת ייעוץ נקודתי",
    inquiryTrack: "ייעוץ נקודתי (שעה)",
    inquiryPriceBeforeVat: '750 ש"ח',
    inquiryDetail: "משך: 60 דקות.",
    inquiryRequiresFitCall: true,
    whatsappText: buildTrackWhatsAppText({
      track: "ייעוץ נקודתי (שעה)",
      priceBeforeVat: '750 ש"ח',
      detail: "משך: 60 דקות.",
      requiresFitCall: true,
    }),
  },
  {
    id: "extended",
    title: "פגישה מורחבת (שעה וחצי)",
    body: "שיחה אחת של 90 דקות לחקירה של כמה מנגנונים בלי לחץ זמן. נדרשת שיחת התאמה לפני תיאום.",
    tags: ["חד פעמי", "90 דקות", '980 ש"ח + מע"מ'],
    ctaLabel: "בקשת פגישה מורחבת",
    inquiryTrack: "פגישה מורחבת (שעה וחצי)",
    inquiryPriceBeforeVat: '980 ש"ח',
    inquiryDetail: "משך: 90 דקות.",
    inquiryRequiresFitCall: true,
    whatsappText: buildTrackWhatsAppText({
      track: "פגישה מורחבת (שעה וחצי)",
      priceBeforeVat: '980 ש"ח',
      detail: "משך: 90 דקות.",
      requiresFitCall: true,
    }),
  },
  {
    id: "podcast",
    title: "פודקאסט מרפסת",
    body: "האזנה חופשית. כל פרק מפרק מנגנון אחד. אפשר גם לבקש עדכונים בוואטסאפ.",
    tags: ["חינם", "האזנה", "שבועי"],
    ctaLabel: "לצפייה בערוץ יוטיוב",
    inquiryTrack: "עדכונים על פודקאסט מרפסת",
    inquiryRequiresFitCall: false,
    whatsappText: buildTrackWhatsAppText({
      track: "עדכונים על פודקאסט מרפסת",
      requiresFitCall: false,
    }),
    externalHref: "https://www.youtube.com/@nevermindname",
    externalLabel: "לצפייה בערוץ יוטיוב",
  },
  {
    id: "library",
    title: "גישה למאגר הסרטונים",
    body: "הרשאה ידנית לצפייה במאגר. בחרו מסגרת מחיר בטבלה למטה, או בקשו גישה כללית לבדיקת התאמה.",
    tags: ["הרשאה אישית", "ללא סליקה ישירה"],
    ctaLabel: "בקשת גישה למאגר",
    inquiryTrack: "הרשאת גישה למאגר הסרטונים",
    inquiryDetail:
      "מסגרת המחיר תיקבע בשיחת התאמה. אין סליקה אוטומטית באתר.",
    inquiryRequiresFitCall: true,
    whatsappText: buildTrackWhatsAppText({
      track: "הרשאת גישה למאגר הסרטונים",
      detail: "מסגרת המחיר תיקבע בשיחת התאמה. אין סליקה אוטומטית באתר.",
      requiresFitCall: true,
    }),
  },
];

/** Interest options for the contact form. */
export const CONTACT_INTERESTS: { id: PathId; label: string }[] = [
  { id: "oneoff", label: "ייעוץ נקודתי (שעה)" },
  { id: "extended", label: "פגישה מורחבת (שעה וחצי)" },
  { id: "podcast", label: "פודקאסט מרפסת" },
  { id: "library", label: "גישה למאגר הסרטונים" },
  { id: "unsure", label: "עדיין לא בטוח - שיחת התאמה" },
];

export const ARCHIVE_PRICING_ROWS: ArchivePricingRow[] = [
  {
    id: "daily",
    frame: "יומי",
    validity: "24 שעות",
    amountIls: 150,
    price: '150 ש"ח',
    analysis: "מסנן כניסה מיידי. למי שזקוק למידע דחוף וממוקד.",
  },
  {
    id: "weekly",
    frame: "שבועי",
    validity: "7 ימים",
    amountIls: 450,
    price: '450 ש"ח',
    analysis: "עלות שוות ערך ל-3 ימים במסלול היומי.",
  },
  {
    id: "monthly",
    frame: "חודשי",
    validity: "30 ימים",
    amountIls: 1250,
    price: '1,250 ש"ח',
    analysis: "גישה חודשית לכלל המנגנונים.",
  },
  {
    id: "yearly",
    frame: "שנתי",
    validity: "12 חודשים",
    amountIls: 7500,
    price: '7,500 ש"ח',
    analysis: 'מסלול יעד לעבודה רציפה (625 ש"ח לחודש).',
  },
  {
    id: "bi-yearly",
    frame: "דו שנתי",
    validity: "24 חודשים",
    amountIls: 12000,
    price: '12,000 ש"ח',
    analysis: "למשתמשים המבינים את ערך השיטה לטווח ארוך.",
  },
  {
    id: "5years",
    frame: "5 שנים",
    validity: "60 חודשים",
    amountIls: 24000,
    price: '24,000 ש"ח',
    analysis: "ודאות כלכלית ומסגרת ארוכת טווח.",
  },
  {
    id: "lifetime",
    frame: "לכל החיים",
    validity: "לצמיתות",
    amountIls: 45000,
    price: '45,000 ש"ח',
    analysis: "תשלום חד פעמי. גישה לצמיתות למאגר החקירה.",
  },
];

/** Format ILS amount as Hebrew price label (before VAT). */
export function formatIlsPrice(amountIls: number): string {
  return `${amountIls.toLocaleString("he-IL")} ש"ח`;
}

/** Club-member discounted price from the archive price list. Floor at 0. */
export function discountedArchiveAmount(
  amountIls: number,
  discountIls: number,
): number {
  return Math.max(0, amountIls - discountIls);
}

export function getArchivePricingById(
  id: string,
): ArchivePricingRow | undefined {
  return ARCHIVE_PRICING_ROWS.find((row) => row.id === id);
}

/** @deprecated Use ARCHIVE_PRICING_ROWS for the paths pricing table. */
export const PRICING_ROWS: PricingRow[] = ARCHIVE_PRICING_ROWS.map((row) => ({
  track: row.frame,
  duration: row.validity,
  price: row.price,
  description: row.analysis,
}));

export const PROCESS_STEPS: ProcessStep[] = [
  {
    index: "01",
    title: "שיחת היכרות",
    body: INTRO_CALL_PROTOCOL,
  },
  {
    index: "02",
    title: "פירוק ראשון",
    body: "בפגישה הראשונה מפרקים מנגנון אחד שיושב לך. רואים איך זה עובד. מחליטים אם להמשיך.",
  },
  {
    index: "03",
    title: "יישור עם המציאות",
    body: "אם ממשיכים, כל פגישה מיישרת עוד פער בין מה שאתה חושב לבין מה שבאמת קורה.",
  },
];

export const CONTACT_FAQ: FaqItem[] = [
  {
    question: "איך החקירה הזו עובדת?",
    answer:
      "לוגיקה טהורה ושכל ישר. פריקה של מה שהתרגלת לחשוב, ויישור השכל עם מה שקורה במציאות. אל תאמין לי. תבדוק בעצמך.",
  },
  {
    question: "מה ההבדל בין ייעוץ נקודתי לפגישה מורחבת?",
    answer:
      "ייעוץ נקודתי הוא שיחה של שעה לפירוק סיטואציה ספציפית. פגישה מורחבת היא שעה וחצי לחקירה עמוקה של כמה מנגנונים בלי לחץ זמן.",
  },
  {
    question: "האם הפודקאסט מרפסת חינמי?",
    answer:
      "כן. הפודקאסט זמין להאזנה חופשית בספוטיפיי. כל פרק מפרק מנגנון אחד. זו דרך לבדוק אם הכיוון מדבר אליך לפני שמתחייבים.",
  },
  {
    question: "איך מקבלים גישה למאגר הסרטונים?",
    answer:
      "הגישה אישית וידנית. אחרי שיחת התאמה, אם זה מתאים, פותחים את החשבון במערכת. אין סליקה אוטומטית באתר.",
  },
  {
    question: "איפה נפגשים?",
    answer:
      "אפשר בזום, אפשר פנים אל פנים במרכז הארץ, ואפשר בשיחת טלפון. מה שנוח לך.",
  },
];

export function getPathById(id: string): PathOffer | undefined {
  return PATH_OFFERS.find((p) => p.id === id);
}

export function buildLeadWhatsAppText(input: {
  name: string;
  phone: string;
  interestLabel: string;
  message?: string;
  source?: string;
}): string {
  const lines = [
    "היי יקיר, הגעתי מהאתר.",
    `שם: ${input.name.trim()}`,
    `טלפון: ${input.phone.trim()}`,
    `מעניין אותי: ${input.interestLabel}`,
  ];
  const msg = input.message?.trim();
  if (msg) {
    lines.push(`מה קורה: ${msg}`);
  }
  const source = input.source?.trim();
  if (source) {
    lines.push(`מקור: ${source}`);
  }
  lines.push("מתי נוח לך שנדבר?");
  return lines.join("\n");
}

/** Human-readable lead source labels for WhatsApp (GEO-friendly plain text). */
export const LEAD_SOURCE_LABELS: Record<string, string> = {
  "mobile-cta": "בר תחתון במובייל",
  watch: "דף צפייה",
  videos: "ספריית וידאו",
  search: "חיפוש",
  home: "עמוד הבית",
  paths: "מסלולים",
};
