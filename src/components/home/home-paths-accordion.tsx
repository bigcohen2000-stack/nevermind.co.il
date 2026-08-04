import Link from "next/link";

import { PathInquiryCta } from "@/components/paths/path-inquiry-cta";
import { PATH_OFFERS } from "@/lib/content/offers";
import { YOUTUBE_CHANNEL_URL } from "@/lib/whatsapp";

/**
 * Home paths band: short CTA to /paths + accordion per track (no dedicated page).
 */
export function HomePathsAccordion() {
  return (
    <div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Link href="/paths" className="btn btn-primary">
          למסלולים ולמחירים
        </Link>
        <Link href="/contact" className="btn btn-secondary">
          שיחת התאמה
        </Link>
      </div>

      <ul className="mt-10 max-w-3xl divide-y divide-foreground/15 border-y border-foreground/15">
        {PATH_OFFERS.map((path) => (
          <li key={path.id}>
            <details className="group py-4">
              <summary className="cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  <span>
                    <span className="block text-lg font-semibold tracking-tight">
                      {path.title}
                    </span>
                    <span className="mt-1 block text-sm text-muted">
                      {path.tags.join(", ")}
                    </span>
                  </span>
                  <span
                    className="mt-1 shrink-0 text-muted transition group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </span>
              </summary>
              <div className="mt-4 space-y-4">
                <p className="max-w-prose text-sm leading-relaxed text-foreground/80">
                  {path.body}
                </p>
                {path.id === "podcast" ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <a
                      href={path.externalHref ?? YOUTUBE_CHANNEL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      {path.ctaLabel}
                    </a>
                    <PathInquiryCta
                      label="בקשת עדכוני פודקאסט"
                      track={path.inquiryTrack ?? path.title}
                      requiresFitCall={path.inquiryRequiresFitCall ?? false}
                      showSms={false}
                      source={`home-${path.id}`}
                    />
                  </div>
                ) : (
                  <PathInquiryCta
                    label={path.ctaLabel}
                    track={path.inquiryTrack ?? path.title}
                    priceBeforeVat={path.inquiryPriceBeforeVat}
                    detail={path.inquiryDetail}
                    requiresFitCall={path.inquiryRequiresFitCall ?? true}
                    source={`home-${path.id}`}
                  />
                )}
                <p className="text-sm text-muted">
                  <Link
                    href="/paths"
                    className="font-medium text-action underline-offset-4 hover:underline"
                  >
                    פירוט מלא ומחירים בעמוד המסלולים
                  </Link>
                </p>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
