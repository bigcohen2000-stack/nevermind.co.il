/**
 * Copy and structure for /books — love investigation + printed book.
 */

export const BOOKS_LOVE_CONCEPT = "אהבה";

export const BOOKS_HERO = {
  eyebrow: "אהבה כמנגנון",
  titleLine1: "אהבה.",
  titleLine2: "ב-20 עמודים.",
  lead:
    "ספר קצר על אהבה כמנגנון, לא כסיפור רומנטי. לידו: סרטונים ומאמרים שממשיכים את אותה חקירה. שולחים את הספר עד הבית. אין סליקה באתר.",
} as const;

export const BOOKS_DELIVERY_HIGHLIGHTS = [
  {
    id: "order",
    icon: "message" as const,
    title: "הזמנה בוואטסאפ",
    body: "כותבים. מקבלים פרטי תשלום ומשלוח. בלי סליקה באתר.",
  },
  {
    id: "ship",
    icon: "truck" as const,
    title: "שולחים עד הבית",
    body: "אחרי תיאום. הספר יוצא במשלוח ישירות אליך.",
  },
  {
    id: "home",
    icon: "home" as const,
    title: "מגיע אליך",
    body: "לא צריך לאסוף מהמדף. מגיעים הביתה בתיאום.",
  },
  {
    id: "read",
    icon: "book" as const,
    title: "קוראים וחוקרים",
    body: "20 עמודים. אחר כך אפשר להמשיך בסרטונים על אהבה.",
  },
] as const;

export const BOOKS_DELIVERY_STEPS = [
  {
    n: "01",
    icon: "message" as const,
    title: "שולחים הזמנה",
    body: "וואטסאפ עם בקשה לספר. מקבלים מחיר ופרטי משלוח.",
  },
  {
    n: "02",
    icon: "package" as const,
    title: "מתאמים משלוח",
    body: "כתובת ואופן תשלום בתיאום. אין קופה אוטומטית באתר.",
  },
  {
    n: "03",
    icon: "truck" as const,
    title: "שולחים הביתה",
    body: "הספר נארז ויוצא. מגיע ישירות לבית.",
  },
] as const;

export const BOOKS_LOVE_LINKS = [
  {
    href: "/search?q=%D7%90%D7%94%D7%91%D7%94",
    label: "חיפוש: אהבה",
    body: "סרטונים, מושגים ומאמרים על אותה חקירה.",
  },
  {
    href: "/mechanisms#relationships",
    label: "מנגנון יחסים",
    body: "אהבה, האשמה וקרבה על אותו ציר.",
  },
  {
    href: "/concepts",
    label: "מדריך מושגים",
    body: "מפת מושגים, כולל אהבה והזדהות.",
  },
  {
    href: "/videos",
    label: "ספריית וידאו",
    body: "להמשיך מהחקירה בקול.",
  },
] as const;

/** Title needles for videos that name the book / love-in-20-pages talk. */
export const LOVE_BOOK_VIDEO_TITLE_NEEDLES = [
  "אהבה ב-20",
  "אהבה ב20",
  "אהבה ב 20",
  "20 עמודים",
] as const;
