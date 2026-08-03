import type { Metadata } from "next";
import Link from "next/link";

import { shareImageMetadata } from "@/lib/og/share-image";

export const metadata: Metadata = {
  title: "מדיניות פרטיות",
  description:
    "מדיניות פרטיות של אתר NeverMind (השם לא משנה). מטרת האתר, איסוף מידע, זכויות עיון ותיקון.",
  alternates: {
    canonical: "https://nevermind.co.il/privacy",
  },
  ...shareImageMetadata("מדיניות פרטיות."),
};

/**
 * Privacy policy: clear for users, honest about practices, without
 * oversharing internal cookie names, studio ops, or security internals.
 */
export default function PrivacyPage() {
  return (
    <main className="w-full bg-background text-foreground" dir="rtl">
      <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <p className="text-xs font-medium tracking-wide text-action">
          משפטי
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          מדיניות פרטיות
        </h1>
        <p className="mt-4 text-sm text-muted">
          עודכן לאחרונה: 3 באוגוסט 2026
        </p>

        <section
          className="mt-8 border border-foreground/15 bg-background p-5 sm:p-6"
          aria-labelledby="privacy-purpose-site"
        >
          <h2
            id="privacy-purpose-site"
            className="text-lg font-semibold tracking-tight"
          >
            מטרת האתר
          </h2>
          <p className="mt-3 max-w-prose text-base leading-relaxed text-foreground/85">
            האתר נוצר למטרת בידור, העשרת הידע הכללי, וחידוד המחשבה. לטובתך
            ולטובת הכלל. התכנים אינם ייעוץ רפואי, משפטי או טיפולי, ואינם מחליפים
            שיחה מקצועית כשנדרשת.
          </p>
        </section>

        <p className="mt-8 max-w-prose text-base leading-relaxed text-foreground/85">
          מסמך זה מסביר איזה מידע אישי עשוי להיאסף באתר nevermind.co.il (השם לא
          משנה / NeverMinde), לשם מה הוא משמש, ומהן זכויותיכם לפי חוק הגנת
          הפרטיות, התשמ&quot;א-1981. השימוש באתר מהווה הסכמה למדיניות זו, בכפוף
          לדין.
        </p>

        <div className="mt-12 space-y-10 text-base leading-relaxed text-foreground/85">
          <section aria-labelledby="privacy-owner">
            <h2
              id="privacy-owner"
              className="text-xl font-semibold tracking-tight"
            >
              1. בעל השליטה במידע
            </h2>
            <p className="mt-3">
              בעל השליטה במידע האישי הנאסף דרך האתר הוא יקיר כהן (NeverMinde /
              השם לא משנה), המפעיל את האתר בכתובת https://nevermind.co.il.
            </p>
            <ul className="mt-4 list-disc space-y-2 pe-5">
              <li>
                פניות בנושא פרטיות:{" "}
                <a
                  href="mailto:hello@nevermind.co.il"
                  className="underline-offset-4 hover:underline"
                >
                  hello@nevermind.co.il
                </a>
              </li>
              <li>
                טופס באתר:{" "}
                <Link
                  href="/contact"
                  className="underline-offset-4 hover:underline"
                >
                  יצירת קשר
                </Link>
              </li>
            </ul>
          </section>

          <section aria-labelledby="privacy-scope">
            <h2
              id="privacy-scope"
              className="text-xl font-semibold tracking-tight"
            >
              2. מה יש באתר
            </h2>
            <p className="mt-3">
              האתר מציע מאמרים, סרטונים, חיפוש, מסלולי שיחה והתאמה, גישה למאגר
              לחברים מורשים, חשבון משתמש לרשימה ולהתקדמות צפייה, ויצירת קשר.
              אין סליקת תשלומים באתר. תשלום, אם רלוונטי, מתבצע מחוץ לאתר בערוץ
              שתואם איתכם.
            </p>
          </section>

          <section aria-labelledby="privacy-data">
            <h2
              id="privacy-data"
              className="text-xl font-semibold tracking-tight"
            >
              3. המידע שנאסף
            </h2>
            <p className="mt-3">
              נאסף רק מה שנדרש להפעלת השירות ולמענה לפניות שלכם.
            </p>

            <h3 className="mt-6 text-base font-semibold tracking-tight">
              3.1 מידע שאתם מוסרים
            </h3>
            <ul className="mt-3 list-disc space-y-2 pe-5">
              <li>
                פנייה או תיאום: שם, טלפון, אימייל (כשבוחרים לשלוח במייל), ותוכן
                הפנייה.
              </li>
              <li>
                טפסי הכנה לפני שיחה או משוב: הטקסט שכתבתם, ופרטי קשר אם מסרתם.
              </li>
              <li>
                חשבון באתר: אימייל, או התחברות דרך Google, לפי מה שבחרתם.
              </li>
              <li>
                כניסה למאגר לחברים: פרטי זיהוי שנמסרו לצורך הרשאה (למשל טלפון).
              </li>
            </ul>

            <h3 className="mt-6 text-base font-semibold tracking-tight">
              3.2 מידע שנוצר בשימוש
            </h3>
            <ul className="mt-3 list-disc space-y-2 pe-5">
              <li>
                בחשבון מחובר: התקדמות צפייה, היסטוריה, וסרטונים ששמרתם.
              </li>
              <li>
                חיפוש באתר: שאילתות לשיפור התוצאות (בלי מעקב פרסום חיצוני).
              </li>
              <li>
                מידע טכני בסיסי לתפעול ואבטחה (למשל יומני שרת אצל ספק האירוח).
              </li>
              <li>
                בדפדפן שלכם בלבד: העדפות נגישות, חיפושים אחרונים, והתקדמות
                צפייה לאורחים (לא נשלחים אלינו כברירת מחדל).
              </li>
            </ul>

            <h3 className="mt-6 text-base font-semibold tracking-tight">
              3.3 מה איננו אוספים כאן
            </h3>
            <p className="mt-3">
              האתר אינו שומר מספרי כרטיס אשראי ואינו מבצע סליקה. אין שימוש מצדנו
              בכלי מעקב פרסום חיצוניים כמו Google Analytics. למדידת ביצועים
              ושימוש באתר אצל ספק האירוח (Vercel Analytics ו-Speed Insights)
              בלבד, לא לפיקסלים פרסומיים.
            </p>
          </section>

          <section aria-labelledby="privacy-purpose">
            <h2
              id="privacy-purpose"
              className="text-xl font-semibold tracking-tight"
            >
              4. למה משתמשים במידע
            </h2>
            <ul className="mt-3 list-disc space-y-2 pe-5">
              <li>לענות לפניות ולתאם שיחה כשביקשתם.</li>
              <li>לתת גישה לתכנים לפי הרשאה שאושרה.</li>
              <li>לנהל חשבון, רשימה, והתקדמות צפייה.</li>
              <li>לשפר חיפוש ותוכן באתר.</li>
              <li>לאבטח את השירות ולמנוע שימוש לרעה.</li>
              <li>לעמוד בחובה חוקית, אם תידרש.</li>
            </ul>
          </section>

          <section aria-labelledby="privacy-share">
            <h2
              id="privacy-share"
              className="text-xl font-semibold tracking-tight"
            >
              5. העברה לצדדים שלישיים
            </h2>
            <p className="mt-3">
              איננו מוכרים מידע אישי. מידע עשוי להיות מעובד אצל ספקים הכרחיים
              להפעלת האתר בלבד:
            </p>
            <ul className="mt-3 list-disc space-y-2 pe-5">
              <li>אירוח האתר ושרתים.</li>
              <li>מסד נתונים והתחברות משתמשים.</li>
              <li>שליחת דוא&quot;ל תפעולי (פניות למנהל האתר).</li>
              <li>
                YouTube להטמעות וידאו. כשנטען נגן YouTube חלים גם תנאי Google /
                YouTube.
              </li>
              <li>
                וואטסאפ או SMS: רק כשאתם בוחרים לפתוח את הערוץ במכשירכם.
              </li>
              <li>
                Vercel: אירוח, ומדידת ביצועים ושימוש באתר (Analytics ו-Speed
                Insights), בלי פיקסלים פרסומיים.
              </li>
            </ul>
            <p className="mt-4">
              חלק מהספקים פועלים מחוץ לישראל. השימוש בהם נעשה לצורך מתן השירות.
              מידע יועבר לרשויות רק אם נדרש על פי דין.
            </p>
          </section>

          <section aria-labelledby="privacy-cookies">
            <h2
              id="privacy-cookies"
              className="text-xl font-semibold tracking-tight"
            >
              6. עוגיות ואחסון בדפדפן
            </h2>
            <p className="mt-3">
              האתר משתמש בעוגיות הכרחיות להתחברות, לשמירת סשן, ולתפעול בסיסי.
              בנוסף נשמרות העדפות מקומיות בדפדפן שלכם (למשל נגישות). אין שימוש
              מצדנו בעוגיות מעקב פרסום של צד שלישי.
            </p>
            <p className="mt-4">
              ניתן למחוק עוגיות ואחסון מקומי בהגדרות הדפדפן. מחיקת עוגיות
              התחברות תנתק אתכם מהחשבון או מהגישה המורשית.
            </p>
          </section>

          <section aria-labelledby="privacy-retention">
            <h2
              id="privacy-retention"
              className="text-xl font-semibold tracking-tight"
            >
              7. שמירת מידע
            </h2>
            <p className="mt-3">
              מידע נשמר כל עוד נדרש למטרה שלשמה נאסף: מענה לפנייה, ניהול גישה,
              אבטחה, או חובה חוקית. אפשר לבקש מחיקה מוקדמת, בכפוף לחובות שמירה
              שבדין.
            </p>
          </section>

          <section aria-labelledby="privacy-security">
            <h2
              id="privacy-security"
              className="text-xl font-semibold tracking-tight"
            >
              8. אבטחה
            </h2>
            <p className="mt-3">
              אנו נוקטים אמצעים סבירים להגנה על מידע, כולל תעבורת HTTPS והגבלת
              גישה. אין אבטחה מוחלטת באינטרנט. אם זיהיתם חשד לדליפה, פנו אלינו.
            </p>
          </section>

          <section aria-labelledby="privacy-rights">
            <h2
              id="privacy-rights"
              className="text-xl font-semibold tracking-tight"
            >
              9. זכויותיכם
            </h2>
            <p className="mt-3">
              לפי חוק הגנת הפרטיות, ובכפוף להחרגות שבדין, ייתכן שתהיו זכאים בין
              היתר ל:
            </p>
            <ul className="mt-3 list-disc space-y-2 pe-5">
              <li>עיון במידע האישי שלכם.</li>
              <li>בקשת תיקון מידע שאינו נכון או מעודכן.</li>
              <li>בקשת מחיקה או הגבלת שימוש, כשמתאים לפי דין.</li>
            </ul>
            <p className="mt-4">
              לבקשות: שלחו מייל אל{" "}
              <a
                href="mailto:hello@nevermind.co.il?subject=%D7%91%D7%A7%D7%A9%D7%AA%20%D7%A4%D7%A8%D7%98%D7%99%D7%95%D7%AA"
                className="underline-offset-4 hover:underline"
              >
                hello@nevermind.co.il
              </a>{" "}
              או השתמשו בטופס{" "}
              <Link
                href="/contact"
                className="underline-offset-4 hover:underline"
              >
                יצירת קשר
              </Link>
              . נזהה אתכם באופן סביר לפני מסירת מידע.
            </p>
          </section>

          <section aria-labelledby="privacy-minors">
            <h2
              id="privacy-minors"
              className="text-xl font-semibold tracking-tight"
            >
              10. קטינים
            </h2>
            <p className="mt-3">
              השירות אינו מיועד לילדים מתחת לגיל 16. איננו אוספים ביודעין מידע
              מקטינים. אם נודע לנו שנאסף מידע כאמור, נפעל למחיקתו.
            </p>
          </section>

          <section aria-labelledby="privacy-third-content">
            <h2
              id="privacy-third-content"
              className="text-xl font-semibold tracking-tight"
            >
              11. קישורים חיצוניים
            </h2>
            <p className="mt-3">
              האתר מקשר לשירותים חיצוניים (למשל YouTube או וואטסאפ). מדיניות זו
              אינה חלה עליהם. מומלץ לעיין במדיניות הפרטיות שלהם.
            </p>
          </section>

          <section aria-labelledby="privacy-a11y">
            <h2
              id="privacy-a11y"
              className="text-xl font-semibold tracking-tight"
            >
              12. נגישות
            </h2>
            <p className="mt-3">
              העדפות סרגל הנגישות נשמרות במכשירכם בלבד. לפירוט ראו{" "}
              <Link
                href="/accessibility"
                className="underline-offset-4 hover:underline"
              >
                הצהרת נגישות
              </Link>
              .
            </p>
          </section>

          <section aria-labelledby="privacy-changes">
            <h2
              id="privacy-changes"
              className="text-xl font-semibold tracking-tight"
            >
              13. שינויים
            </h2>
            <p className="mt-3">
              נוכל לעדכן מדיניות זו מעת לעת. תאריך העדכון יופיע בראש העמוד.
              שינויים מהותיים באופן איסוף המידע יפורסמו כאן.
            </p>
          </section>

          <section aria-labelledby="privacy-disclaimer">
            <h2
              id="privacy-disclaimer"
              className="text-xl font-semibold tracking-tight"
            >
              14. הבהרה
            </h2>
            <p className="mt-3 text-sm text-muted">
              מסמך זה משקף את אופן הפעלת האתר במועד העדכון. הוא אינו ייעוץ
              משפטי. לשאלות פרטניות מומלץ להיוועץ בעורך דין.
            </p>
          </section>
        </div>

        <div className="mt-14 flex flex-wrap gap-3">
          <Link href="/contact" className="btn btn-primary text-sm">
            יצירת קשר
          </Link>
          <Link href="/accessibility" className="btn btn-secondary text-sm">
            הצהרת נגישות
          </Link>
          <Link href="/" className="btn btn-secondary text-sm">
            חזרה לבית
          </Link>
        </div>
      </article>
    </main>
  );
}
