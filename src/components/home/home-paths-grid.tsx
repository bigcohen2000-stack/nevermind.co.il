import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Clock3,
  Headphones,
  Library,
  MessageCircle,
  Phone,
} from "lucide-react";

import { PathInquiryCta } from "@/components/paths/path-inquiry-cta";
import { PATH_OFFERS, type PathId } from "@/lib/content/offers";
import { YOUTUBE_CHANNEL_URL } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const PATH_ICONS: Record<Exclude<PathId, "unsure">, LucideIcon> = {
  oneoff: MessageCircle,
  extended: Clock3,
  podcast: Headphones,
  library: Library,
};

/**
 * Home paths band: four tracks with icons, tags, and real CTAs.
 */
export function HomePathsGrid() {
  return (
    <div>
      <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
        {PATH_OFFERS.map((path) => {
          const Icon =
            (path.id !== "unsure" ? PATH_ICONS[path.id] : undefined) ??
            MessageCircle;
          const priceTag = path.tags.find((t) => t.includes("ש\"ח") || t === "חינם");
          const metaTags = path.tags.filter((t) => t !== priceTag);

          return (
            <li
              key={path.id}
              className="card flex h-full flex-col p-5 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span
                  className="inline-flex size-10 shrink-0 items-center justify-center border border-foreground/15 text-action"
                  aria-hidden="true"
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
                    {path.title}
                  </h3>
                  {priceTag ? (
                    <p className="mt-1 text-sm font-medium text-action">
                      {priceTag}
                    </p>
                  ) : null}
                </div>
              </div>

              <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/80">
                {path.body}
              </p>

              {metaTags.length > 0 ? (
                <ul
                  className="mt-4 flex flex-wrap gap-2"
                  aria-label="פרטי מסלול"
                >
                  {metaTags.map((tag) => (
                    <li
                      key={tag}
                      className="border border-foreground/15 px-2 py-0.5 text-xs text-muted"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className={cn("mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap")}>
                {path.id === "podcast" ? (
                  <>
                    <a
                      href={path.externalHref ?? YOUTUBE_CHANNEL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary text-sm"
                    >
                      <Headphones
                        className="size-3.5"
                        aria-hidden="true"
                        strokeWidth={1.75}
                      />
                      {path.ctaLabel}
                    </a>
                    <PathInquiryCta
                      label="בקשת עדכוני פודקאסט"
                      track={path.inquiryTrack ?? path.title}
                      requiresFitCall={path.inquiryRequiresFitCall ?? false}
                      showSms={false}
                      source={`home-${path.id}`}
                      className="sm:w-auto [&_button]:w-full sm:[&_button]:w-auto"
                    />
                  </>
                ) : path.id === "library" ? (
                  <>
                    <PathInquiryCta
                      label={path.ctaLabel}
                      track={path.inquiryTrack ?? path.title}
                      priceBeforeVat={path.inquiryPriceBeforeVat}
                      detail={path.inquiryDetail}
                      requiresFitCall={path.inquiryRequiresFitCall ?? true}
                      source={`home-${path.id}`}
                      className="sm:w-auto [&_button]:w-full sm:[&_button]:w-auto"
                    />
                    <Link href="/members#membership-prices" className="btn btn-secondary text-sm">
                      למחירון מאגר
                    </Link>
                  </>
                ) : (
                  <PathInquiryCta
                    label={path.ctaLabel}
                    track={path.inquiryTrack ?? path.title}
                    priceBeforeVat={path.inquiryPriceBeforeVat}
                    detail={path.inquiryDetail}
                    requiresFitCall={path.inquiryRequiresFitCall ?? true}
                    source={`home-${path.id}`}
                    className="sm:w-auto [&_button]:w-full sm:[&_button]:w-auto"
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <nav
        aria-label="המשך למסלולים"
        className="mt-8 flex flex-col gap-3 border-t border-foreground/10 pt-8 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <Link href="/paths" className="btn btn-primary text-sm">
          לכל המסלולים והמחירים
        </Link>
        <Link href="/contact" className="btn btn-secondary text-sm">
          <Phone className="size-3.5" aria-hidden="true" strokeWidth={1.75} />
          שיחת התאמה
        </Link>
        <Link href="/booking" className="btn btn-secondary text-sm">
          מפרק מחשבות
        </Link>
      </nav>
    </div>
  );
}
