import Link from "next/link";

import { InfoTip } from "@/components/ui/info-tip";
import {
  ACCESS_LAYER_LABELS,
  ACCOUNT_ACCESS_BENEFITS,
  CLUB_ACCESS_BENEFITS,
  FREE_ACCESS_BENEFITS,
} from "@/lib/content/access-layers";

/**
 * Three access layers side by side: guest, email account, club.
 */
export function AccessLayersCompare() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section
        aria-labelledby="guest-access-title"
        className="border border-[#121212]/20 bg-background p-5 sm:p-6"
      >
        <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted">
          <span>{ACCESS_LAYER_LABELS.guest}</span>
          <InfoTip label="הסבר על שכבת אורח">
            בלי הרשמה. תוכן ציבורי וטיזר בלבד.
          </InfoTip>
        </p>
        <h3
          id="guest-access-title"
          className="mt-2 text-xl font-semibold tracking-tight"
        >
          בלי חשבון.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          פתוח לכולם. בלי מייל ובלי מועדון.
        </p>
        <ul className="mt-6 space-y-5">
          {FREE_ACCESS_BENEFITS.map((item) => (
            <li key={item.title}>
              <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <span>{item.title}</span>
                <InfoTip label={`הסבר: ${item.title}`}>{item.tip}</InfoTip>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/videos?filter=open" className="btn btn-secondary">
            סרטונים פתוחים
          </Link>
          <Link href="/articles" className="btn btn-secondary">
            מאמרים
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="account-access-title"
        className="border border-foreground/25 bg-background p-5 sm:p-6"
      >
        <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-foreground/80">
          <span>{ACCESS_LAYER_LABELS.account}</span>
          <InfoTip label="הסבר על חשבון מייל">
            קישור לאימייל. רשימה והיסטוריה. לא פותח מאגר.
          </InfoTip>
        </p>
        <h3
          id="account-access-title"
          className="mt-2 text-xl font-semibold tracking-tight"
        >
          חשבון חינם.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          זיכרון אישי של חקירה. בלי תשלום. בלי מאגר מועדון.
        </p>
        <ul className="mt-6 space-y-5">
          {ACCOUNT_ACCESS_BENEFITS.map((item) => (
            <li key={item.title}>
              <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <span>{item.title}</span>
                <InfoTip label={`הסבר: ${item.title}`}>{item.tip}</InfoTip>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/profile?mode=register" className="btn btn-secondary">
            חשבון חינם
          </Link>
          <Link href="/my-list" className="btn btn-secondary">
            הרשימה שלי
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="club-access-title"
        className="border border-action bg-background p-5 sm:p-6"
      >
        <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-action">
          <span>{ACCESS_LAYER_LABELS.club}</span>
          <InfoTip label="הסבר על שכבת מועדון">
            נפתח אחרי שיחת התאמה. בלי סליקה באתר.
          </InfoTip>
        </p>
        <h3
          id="club-access-title"
          className="mt-2 text-xl font-semibold tracking-tight"
        >
          מאגר מלא.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          אחרי שיחת התאמה. בלי סליקה באתר.
        </p>
        <ul className="mt-6 space-y-5">
          {CLUB_ACCESS_BENEFITS.map((item) => (
            <li key={item.title}>
              <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <span>
                  <span className="text-action">מועדון: </span>
                  {item.title}
                </span>
                <InfoTip label={`הסבר: ${item.title}`}>{item.tip}</InfoTip>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#access" className="btn btn-primary">
            בקשת גישה
          </a>
          <Link href="/paths" className="btn btn-secondary">
            מסלולים ומחירים
          </Link>
        </div>
      </section>
    </div>
  );
}
