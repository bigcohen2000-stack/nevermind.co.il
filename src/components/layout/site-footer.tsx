import Link from "next/link";

import { InstallAppButton } from "@/components/layout/install-app-button";
import { SiteLogo } from "@/components/layout/site-logo";
import { SocialOutboundLinks } from "@/components/layout/social-outbound-links";
import { getApplePodcastUrl } from "@/lib/podcast/links";
import { FOOTER_NAV, LEGAL_NAV } from "@/lib/site-nav";
import { buildWhatsAppHrefPlain } from "@/lib/whatsapp";

/**
 * SiteFooter — dark RTL footer with crawlable sitemap groups and install CTA.
 */

const currentYear = new Date().getFullYear();

const exploreLinks = FOOTER_NAV.filter((l) =>
  [
    "/search",
    "/videos",
    "/articles",
    "/concepts",
    "/members",
    "/mechanisms",
    "/paths",
  ].includes(l.href),
);

const accountLinks = FOOTER_NAV.filter((l) =>
  ["/books", "/booking", "/contact", "/my-list", "/profile"].includes(l.href),
);

export function SiteFooter() {
  const whatsappHref = buildWhatsAppHrefPlain();
  const appleUrl = getApplePodcastUrl();

  return (
    <footer className="band-dark text-foreground">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <SiteLogo variant="on-dark" size="footer" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-foreground/70 sm:text-base">
              ניתוח לוגי של המציאות. הפרדה בין עובדה לבין סיפור, ללא דרמה.
            </p>
            <div className="mt-6">
              <InstallAppButton />
            </div>
            <SocialOutboundLinks className="mt-8" />
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-foreground/80 no-underline transition-colors duration-200 hover:text-foreground hover:no-underline"
              >
                וואטסאפ
              </a>
              {appleUrl ? (
                <a
                  href={appleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-foreground/80 no-underline transition-colors duration-200 hover:text-foreground hover:no-underline"
                >
                  Apple Podcasts
                </a>
              ) : null}
              <Link
                href="/api/podcast.xml"
                className="inline-flex min-h-11 items-center text-foreground/80 no-underline transition-colors duration-200 hover:text-foreground hover:no-underline"
              >
                RSS
              </Link>
            </div>
          </div>

          <nav aria-label="חקירה" className="lg:col-span-3">
            <p className="text-xs font-medium tracking-wide text-muted">חקירה</p>
            <ul className="mt-3 flex flex-col gap-1 text-sm">
              <li>
                <Link
                  href="/"
                  className="inline-flex min-h-11 items-center text-foreground/80 no-underline transition-colors duration-200 hover:text-foreground hover:no-underline"
                >
                  ראשי
                </Link>
              </li>
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-foreground/80 no-underline transition-colors duration-200 hover:text-foreground hover:no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="המשך וחשבון" className="lg:col-span-4">
            <p className="text-xs font-medium tracking-wide text-muted">
              המשך וחשבון
            </p>
            <ul className="mt-3 flex flex-col gap-1 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6 lg:flex-col lg:gap-1">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-foreground/80 no-underline transition-colors duration-200 hover:text-foreground hover:no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-12 border border-foreground/15 bg-foreground/[0.03] px-4 py-3 text-xs leading-relaxed text-foreground/70 sm:text-sm">
          חיבור מאובטח SSL (Vercel) · קבלה/חשבונית מס מופקת כחוק · תיאום וסליקה
          בשיחה ישירה בלבד
        </p>

        <div className="mt-6 flex flex-col gap-4 border-t border-foreground/15 pt-6 text-sm text-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} השם לא משנה · NeverMinde: יקיר כהן</p>
          <nav aria-label="מידע משפטי" className="flex flex-wrap gap-x-4 gap-y-2">
            {LEGAL_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 items-center text-foreground/70 no-underline transition-colors hover:text-foreground hover:no-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
