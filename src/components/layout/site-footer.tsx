import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  BookMarked,
  BookOpen,
  CalendarDays,
  Compass,
  Film,
  Home,
  KeyRound,
  Lightbulb,
  Lock,
  Mail,
  MessageCircle,
  Podcast,
  Radio,
  Rss,
  Search,
  Settings2,
  Shield,
  Star,
  UserRound,
} from "lucide-react";

import { InstallAppButton } from "@/components/layout/install-app-button";
import { SiteLogo } from "@/components/layout/site-logo";
import { SocialOutboundLinks } from "@/components/layout/social-outbound-links";
import { InfoTip } from "@/components/ui/info-tip";
import { getApplePodcastUrl } from "@/lib/podcast/links";
import { FOOTER_NAV, LEGAL_NAV } from "@/lib/site-nav";
import { buildWhatsAppHrefPlain } from "@/lib/whatsapp";

/**
 * SiteFooter — dark RTL footer with crawlable sitemap, icons, and install CTA.
 */

const currentYear = new Date().getFullYear();

const FOOTER_ICONS: Record<string, LucideIcon> = {
  "/": Home,
  "/search": Search,
  "/videos": Film,
  "/articles": BookOpen,
  "/concepts": Lightbulb,
  "/members": KeyRound,
  "/mechanisms": Settings2,
  "/paths": Compass,
  "/live": Radio,
  "/books": BookMarked,
  "/booking": CalendarDays,
  "/contact": Mail,
  "/my-list": Star,
  "/profile": UserRound,
  "/privacy": Shield,
  "/accessibility": Accessibility,
};

const exploreHrefs = new Set([
  "/search",
  "/videos",
  "/articles",
  "/concepts",
  "/live",
  "/members",
  "/mechanisms",
  "/paths",
]);

const accountHrefs = new Set([
  "/books",
  "/booking",
  "/contact",
  "/my-list",
  "/profile",
]);

const exploreLinks = FOOTER_NAV.filter((l) => exploreHrefs.has(l.href));
const accountLinks = FOOTER_NAV.filter((l) => accountHrefs.has(l.href));

function FooterNavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const Icon = FOOTER_ICONS[href] ?? Compass;
  return (
    <Link
      href={href}
      prefetch={false}
      className="inline-flex min-h-11 items-center gap-2 text-foreground/80 no-underline transition-colors duration-200 hover:text-foreground hover:no-underline"
    >
      <Icon className="size-3.5 shrink-0 text-action/80" aria-hidden strokeWidth={1.75} />
      {label}
    </Link>
  );
}

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
                className="inline-flex min-h-11 items-center gap-2 text-foreground/80 no-underline transition-colors duration-200 hover:text-foreground hover:no-underline"
                aria-label="פתיחת וואטסאפ"
              >
                <MessageCircle
                  className="size-3.5 text-action/80"
                  aria-hidden
                  strokeWidth={1.75}
                />
                וואטסאפ
              </a>
              {appleUrl ? (
                <a
                  href={appleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-foreground/80 no-underline transition-colors duration-200 hover:text-foreground hover:no-underline"
                  aria-label="Apple Podcasts"
                >
                  <Podcast
                    className="size-3.5 text-action/80"
                    aria-hidden
                    strokeWidth={1.75}
                  />
                  Apple Podcasts
                </a>
              ) : null}
              <Link
                href="/api/podcast.xml"
                prefetch={false}
                className="inline-flex min-h-11 items-center gap-2 text-foreground/80 no-underline transition-colors duration-200 hover:text-foreground hover:no-underline"
                aria-label="פיד RSS של הפודקאסט"
              >
                <Rss
                  className="size-3.5 text-action/80"
                  aria-hidden
                  strokeWidth={1.75}
                />
                RSS
              </Link>
            </div>
          </div>

          <nav aria-label="חקירה" className="lg:col-span-3">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted">
              חקירה
              <InfoTip label="קישורי חקירה" tone="dark" className="size-6">
                חיפוש, וידאו, מאמרים, מושגים, שידור חי ומסלולים. הקישורים
                סורקים לגוגל ולניווט מהיר.
              </InfoTip>
            </p>
            <ul className="mt-3 flex flex-col gap-1 text-sm">
              <li>
                <FooterNavLink href="/" label="ראשי" />
              </li>
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <FooterNavLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="המשך וחשבון" className="lg:col-span-4">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted">
              המשך וחשבון
              <InfoTip label="חשבון והמשך" tone="dark" className="size-6">
                ספרים ותכנים, תיאום שיחה, יצירת קשר, הרשימה והפרופיל.
              </InfoTip>
            </p>
            <ul className="mt-3 flex flex-col gap-1 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6 lg:flex-col lg:gap-1">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <FooterNavLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-12 flex flex-wrap items-start gap-2 border border-foreground/15 bg-foreground/[0.03] px-4 py-3 text-xs leading-relaxed text-foreground/70 sm:text-sm">
          <Lock
            className="mt-0.5 size-3.5 shrink-0 text-action/80"
            aria-hidden
            strokeWidth={1.75}
          />
          <span className="min-w-0 flex-1">
            חיבור מאובטח SSL (Vercel). קבלה/חשבונית מס מופקת כחוק. תיאום וסליקה
            בשיחה ישירה בלבד
          </span>
          <InfoTip label="אבטחה ותשלום" tone="dark" className="size-6">
            האתר רץ על HTTPS. אין סליקת כרטיס באתר. תיאום ותשלום בשיחה ישירה.
            חשבונית מופקת כחוק לפי הצורך.
          </InfoTip>
        </p>

        <div className="mt-6 flex flex-col gap-4 border-t border-foreground/15 pt-6 text-sm text-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} השם לא משנה. NeverMind.co.il</p>
          <nav
            aria-label="מידע משפטי"
            className="flex flex-wrap gap-x-4 gap-y-2"
          >
            {LEGAL_NAV.map((link) => {
              const Icon = FOOTER_ICONS[link.href] ?? Shield;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className="inline-flex min-h-11 items-center gap-1.5 text-foreground/70 no-underline transition-colors hover:text-foreground hover:no-underline"
                >
                  <Icon
                    className="size-3.5 shrink-0 text-action/70"
                    aria-hidden
                    strokeWidth={1.75}
                  />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
