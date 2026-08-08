import type { Metadata } from "next";
import Link from "next/link";

import { Eyebrow } from "@/components/ui/editorial";
import { shareImageMetadata } from "@/lib/og/share-image";
import { buildWhatsAppHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "הצהרת נגישות",
  description:
    "הצהרת נגישות של אתר NeverMind (השם לא משנה). התאמה לתקן הישראלי ת\"י 5568.",
  alternates: {
    canonical: "https://nevermind.co.il/accessibility",
  },
  ...shareImageMetadata("הצהרת נגישות."),
};

const ACCESS_HELP =
  "היי יקיר, פנייה בנושא נגישות באתר nevermind.co.il. אשמח לעזרה.";

/**
 * Israeli accessibility declaration (ת\"י 5568 / WCAG 2.0 AA aligned).
 * Update the "עודכן לאחרונה" date when substantive a11y work ships.
 */
export default function AccessibilityPage() {
  return (
    <main className="w-full bg-background text-foreground" dir="rtl">
      <div className="mx-auto w-full max-w-3xl px-6 py-16 lg:py-24">
        <Eyebrow>משפטי</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight lg:text-5xl">
          הצהרת נגישות
        </h1>
        <p className="mt-4 text-sm text-muted">עודכן לאחרונה: 2 באוגוסט 2026</p>

        <div className="mt-10 space-y-10 text-base leading-relaxed text-foreground/85">
          <section aria-labelledby="a11y-commit">
            <h2 id="a11y-commit" className="text-xl font-semibold tracking-tight">
              מחויבות
            </h2>
            <p className="mt-3">
              אתר NeverMind (השם לא משנה) בכתובת nevermind.co.il מחויב להנגשה
              של תכניו ושירותיו לציבור הרחב, כולל אנשים עם מוגבלות. אנו פועלים
              ליישום הנחיות הנגישות בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות,
              התשנ&quot;ח-1998, ולתקנות שהותקנו מכוחו.
            </p>
          </section>

          <section aria-labelledby="a11y-standard">
            <h2
              id="a11y-standard"
              className="text-xl font-semibold tracking-tight"
            >
              תקן היעד
            </h2>
            <p className="mt-3">
              האתר שואף לעמוד בדרישות התקן הישראלי ת&quot;י 5568, המבוסס על הנחיות
              WCAG 2.0 ברמת AA. העבודה נמשכת. חלקים מהאתר כבר מותאמים, וחלקים
              עדיין בשיפור.
            </p>
          </section>

          <section aria-labelledby="a11y-measures">
            <h2
              id="a11y-measures"
              className="text-xl font-semibold tracking-tight"
            >
              מה מיושם באתר
            </h2>
            <ul className="mt-3 list-disc space-y-2 pe-5">
              <li>מבנה סמנטי עם כותרות, ניווט, ו־main ברורים.</li>
              <li>תמיכה בניווט מקלדת ובמצב מיקוד נראה.</li>
              <li>טקסט חלופי לתמונות משמעותיות, כשמתאים.</li>
              <li>התאמה לכיוון עברית (RTL) ולגופנים קריאים.</li>
              <li>כיבוד העדפת reduced-motion בדפדפן, במקומות רלוונטיים.</li>
              <li>קישורי דילוג ותפריט נגיש במובייל (פתיחה וסגירה עם Escape).</li>
            </ul>
          </section>

          <section aria-labelledby="a11y-limits">
            <h2
              id="a11y-limits"
              className="text-xl font-semibold tracking-tight"
            >
              מגבלות ידועות
            </h2>
            <p className="mt-3">
              חלק מהתכנים מגיעים ממקורות חיצוניים (למשל נגן YouTube). שליטתנו
              בנגישות של רכיבים חיצוניים מוגבלת. ייתכנו גם מסמכים או מדיה ישנה
              שעדיין לא הונגשו במלואם. אם נתקלתם במחסום, נשמח לטפל בפנייה.
            </p>
          </section>

          <section aria-labelledby="a11y-compat">
            <h2
              id="a11y-compat"
              className="text-xl font-semibold tracking-tight"
            >
              תאימות והמלצות שימוש
            </h2>
            <p className="mt-3">
              האתר נבדק בדפדפנים נפוצים עדכניים (Chrome, Firefox, Safari, Edge)
              ובגדלי מסך שונים. מומלץ להשתמש בדפדפן מעודכן. ניתן להיעזר בכלי
              נגישות מובנים במערכת ההפעלה ובתוכנות קורא מסך.
            </p>
          </section>

          <section aria-labelledby="a11y-contact">
            <h2
              id="a11y-contact"
              className="text-xl font-semibold tracking-tight"
            >
              פניות בנושא נגישות
            </h2>
            <p className="mt-3">
              רכז נגישות: יקיר כהן. נשמח לקבל הערות, דיווח על תקלה, או בקשה
              לקבלת מידע בפורמט נגיש.
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="underline-offset-4 hover:underline"
                >
                  טופס יצירת קשר באתר
                </Link>
              </li>
              <li>
                <a
                  href={buildWhatsAppHref(ACCESS_HELP)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:underline"
                >
                  וואטסאפ לפנייה מהירה
                </a>
              </li>
            </ul>
            <p className="mt-4 text-sm text-muted">
              נשתדל לחזור אליכם בהקדם. בפניות מורכבות ייתכן שיידרש זמן נוסף
              לבדיקה ולתיקון.
            </p>
          </section>

          <section aria-labelledby="a11y-legal">
            <h2 id="a11y-legal" className="text-xl font-semibold tracking-tight">
              הבהרה
            </h2>
            <p className="mt-3 text-sm text-muted">
              הצהרה זו מתארת את מצב הנגישות באתר במועד העדכון. היא אינה מחליפה
              ייעוץ משפטי. נמשיך לעדכן אותה ככל שיתווספו שיפורים מהותיים.
            </p>
          </section>
        </div>

        <p className="mt-14">
          <Link href="/" className="btn btn-secondary text-sm">
            חזרה לבית
          </Link>
        </p>
      </div>
    </main>
  );
}
