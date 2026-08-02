import Link from "next/link";

import { PrivatePodcastBanner } from "@/components/members/private-podcast-banner";
import { WhatsAppTrackCta } from "@/components/paths/whatsapp-track-cta";
import {
  ARCHIVE_PRICING_ROWS,
  ARCHIVE_SYLLABUS,
  ARCHIVE_TOOLS_NOTE,
  buildArchiveAccessWhatsAppText,
  buildIntroCallWhatsAppText,
  CAPACITY_STATUS,
  DEFAULT_ARCHIVE_PRICING_ID,
  getCapacityLabel,
  INTRO_CALL_PROTOCOL,
  NO_AUTO_CHECKOUT_NOTE,
  PATH_OFFERS,
  REFUND_POLICY_NOTE,
  RESPONSE_SLA_NOTE,
  VAT_FOOTER_NOTE,
} from "@/lib/content/offers";
import { YOUTUBE_CHANNEL_URL } from "@/lib/whatsapp";

type PricingTracksProps = {
  hasVideoAccess?: boolean;
};

const sharpCard =
  "flex h-full flex-col rounded-none border border-[#1A1A1A] bg-[#FAFAF8] p-6 shadow-none";

const primaryLinkClass =
  "inline-flex min-h-12 items-center justify-center rounded-none border border-[#D42B2B] bg-[#D42B2B] px-5 py-3 text-sm font-medium text-white shadow-none transition hover:bg-[#B82424] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D42B2B]";

const secondaryLinkClass =
  "inline-flex min-h-12 items-center justify-center rounded-none border border-[#1A1A1A] bg-transparent px-5 py-3 text-sm font-medium text-[#1A1A1A] shadow-none transition hover:bg-[#1A1A1A]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]";

/**
 * Zero-drama pricing and tracks: 4 cards + archive access table + facts.
 * Each primary CTA states the exact track or authorization frame requested.
 * Scoped sharp styles (rounded-none). No checkout.
 */
export function PricingTracks({ hasVideoAccess = false }: PricingTracksProps) {
  const capacityLabel = getCapacityLabel(CAPACITY_STATUS);
  const introMessage = buildIntroCallWhatsAppText();

  return (
    <div className="bg-[#FAFAF8] text-[#1A1A1A]">
      <section
        aria-labelledby="pricing-tracks-title"
        className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20"
      >
        <p className="text-xs font-medium tracking-wide text-[#D42B2B]">
          בחירת מסלול
        </p>
        <h1
          id="pricing-tracks-title"
          className="mt-4 max-w-3xl text-[1.75rem] font-semibold tracking-tight leading-tight sm:text-4xl lg:text-5xl"
        >
          מסלולים ומחירים. בקשה מדויקת, לא שיחה כללית.
        </h1>
        <p className="mt-5 max-w-prose text-base leading-relaxed text-[#9CA3AF] sm:text-lg">
          בחרו מסלול או מסגרת גישה. הכפתור שולח לוואטסאפ (או SMS) את מה שאתם
          מבקשים, כולל מסגרת מחיר לפני מע&quot;מ. אין סליקה באתר. התאמה נבדקת
          בשיחה.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <p className="rounded-none border border-[#1A1A1A] px-3 py-2 text-xs text-[#1A1A1A]">
            סטטוס קליטה: {capacityLabel}
          </p>
          <WhatsAppTrackCta
            message={introMessage}
            label="בקשת שיחת התאמה"
          />
        </div>

        <ul className="mt-10 grid gap-4 sm:mt-14 md:grid-cols-2 xl:grid-cols-4">
          {PATH_OFFERS.map((path) => (
            <li key={path.id} className={sharpCard}>
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                {path.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[#9CA3AF]">
                {path.body}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="תגיות">
                {path.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-none border border-[#1A1A1A] px-2 py-1 text-xs text-[#9CA3AF]"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {path.id === "podcast" ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <a
                      href={path.externalHref ?? YOUTUBE_CHANNEL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={primaryLinkClass}
                    >
                      {path.ctaLabel}
                    </a>
                    <WhatsAppTrackCta
                      message={path.whatsappText}
                      label="בקשת עדכוני פודקאסט"
                      showSms={false}
                    />
                  </div>
                ) : path.id === "library" && hasVideoAccess ? (
                  <Link href="/videos" className={primaryLinkClass}>
                    כניסה למאגר
                  </Link>
                ) : (
                  <WhatsAppTrackCta
                    message={path.whatsappText}
                    label={path.ctaLabel}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="archive-pricing-title"
        className="border-t border-[#1A1A1A]"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
          <h2
            id="archive-pricing-title"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            מסגרות הרשאה למאגר
          </h2>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-[#9CA3AF]">
            בחרו מסגרת. הכפתור שולח בקשה עם המסגרת והמחיר שלה. הגישה ניתנת ידנית
            אחרי שיחת התאמה. כל מסגרת כוללת מאגר מלא ופיד פודקאסט פרטי. חינם
            בלי מסגרת: סרטונים פתוחים, מאמרים, ופיד RSS ציבורי.
          </p>

          {/* Mobile: stacked cards */}
          <ul className="mt-8 space-y-3 md:hidden">
            {ARCHIVE_PRICING_ROWS.map((row) => {
              const highlighted = row.id === DEFAULT_ARCHIVE_PRICING_ID;
              return (
                <li
                  key={row.id}
                  className={
                    highlighted
                      ? "border border-[#D42B2B] bg-[#FAFAF8] p-5"
                      : "border border-[#1A1A1A] bg-[#FAFAF8] p-5"
                  }
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {row.frame}
                      {highlighted ? (
                        <span className="ms-2 text-xs font-medium text-[#D42B2B]">
                          מסלול יעד
                        </span>
                      ) : null}
                    </h3>
                    <p className="shrink-0 text-base font-semibold tabular-nums">
                      {row.price}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-[#9CA3AF]">
                    תוקף: {row.validity}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/80">
                    {row.analysis}
                  </p>
                  <div className="mt-5">
                    {hasVideoAccess ? (
                      <Link href="/videos" className={secondaryLinkClass}>
                        כניסה למאגר
                      </Link>
                    ) : (
                      <WhatsAppTrackCta
                        message={buildArchiveAccessWhatsAppText(
                          row.frame,
                          row.price,
                        )}
                        label={`בקשת מסגרת ${row.frame}`}
                        showSms={false}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Desktop: table */}
          <div className="mt-10 hidden overflow-x-auto overscroll-x-contain md:block">
            <table className="w-full min-w-[48rem] border-collapse text-start text-sm">
              <thead>
                <tr className="border-b border-[#1A1A1A] text-[#9CA3AF]">
                  <th className="py-3 pe-4 font-medium">מסגרת גישה</th>
                  <th className="py-3 pe-4 font-medium">תוקף הרשאה</th>
                  <th className="py-3 pe-4 font-medium">עלות (לפני מע&quot;מ)</th>
                  <th className="py-3 pe-4 font-medium">ניתוח לוגי</th>
                  <th className="py-3 font-medium">פעולה</th>
                </tr>
              </thead>
              <tbody>
                {ARCHIVE_PRICING_ROWS.map((row) => {
                  const highlighted = row.id === DEFAULT_ARCHIVE_PRICING_ID;
                  return (
                    <tr
                      key={row.id}
                      className={
                        highlighted
                          ? "border-b border-[#D42B2B]/40 bg-[#D42B2B]/5 align-top"
                          : "border-b border-[#1A1A1A]/30 align-top"
                      }
                    >
                      <td className="py-4 pe-4 font-medium text-[#1A1A1A]">
                        {row.frame}
                        {highlighted ? (
                          <span className="ms-2 text-xs font-medium text-[#D42B2B]">
                            מסלול יעד
                          </span>
                        ) : null}
                      </td>
                      <td className="py-4 pe-4 text-[#1A1A1A]/80">
                        {row.validity}
                      </td>
                      <td className="py-4 pe-4 text-[#1A1A1A]/80">
                        {row.price}
                      </td>
                      <td className="py-4 pe-4 text-[#9CA3AF]">{row.analysis}</td>
                      <td className="py-4">
                        {hasVideoAccess ? (
                          <Link href="/videos" className={secondaryLinkClass}>
                            כניסה למאגר
                          </Link>
                        ) : (
                          <WhatsAppTrackCta
                            message={buildArchiveAccessWhatsAppText(
                              row.frame,
                              row.price,
                            )}
                            label={`בקשת מסגרת ${row.frame}`}
                            showSms={false}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="mt-8 max-w-3xl space-y-2 text-sm leading-relaxed text-[#9CA3AF]">
            <li>* {VAT_FOOTER_NOTE}</li>
            <li>* {REFUND_POLICY_NOTE}</li>
            <li>* {NO_AUTO_CHECKOUT_NOTE}</li>
            <li>* {RESPONSE_SLA_NOTE}</li>
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="archive-facts-title"
        className="border-t border-[#1A1A1A]"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
          <h2
            id="archive-facts-title"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            עובדות על המאגר
          </h2>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-[#9CA3AF]">
            {ARCHIVE_TOOLS_NOTE}
          </p>

          <div className="mt-8">
            <PrivatePodcastBanner
              density="compact"
              memberMode={Boolean(hasVideoAccess)}
            />
          </div>

          <h3 className="mt-10 text-sm font-medium tracking-wide text-[#D42B2B]">
            מנגנונים במאגר (רשימה שמית)
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {ARCHIVE_SYLLABUS.map((item) => (
              <li
                key={item}
                className="rounded-none border border-[#1A1A1A] px-3 py-1.5 text-sm text-[#1A1A1A]"
              >
                {item}
              </li>
            ))}
          </ul>

          <h3 className="mt-12 text-sm font-medium tracking-wide text-[#D42B2B]">
            שיחת התאמה
          </h3>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-[#9CA3AF]">
            {INTRO_CALL_PROTOCOL}
          </p>
          <div className="mt-6">
            <WhatsAppTrackCta
              message={introMessage}
              label="בקשת שיחת התאמה"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
