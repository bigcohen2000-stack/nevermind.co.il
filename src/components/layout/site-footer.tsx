import Link from "next/link";

import { buildWhatsAppHrefPlain, YOUTUBE_CHANNEL_URL } from "@/lib/whatsapp";

/**
 * SiteFooter — premium dark RTL footer.
 */

const footerLinks = [
  { label: "ראשי", href: "/" },
  { label: "מסלולים", href: "/paths" },
  { label: "מאמרים", href: "/articles" },
  { label: "מנגנונים", href: "/mechanisms" },
  { label: "וידאו", href: "/videos" },
  { label: "תכנים", href: "/books" },
  { label: "יצירת קשר", href: "/contact" },
];

const currentYear = new Date().getFullYear();

export function SiteFooter() {
  const whatsappHref = buildWhatsAppHrefPlain();

  return (
    <footer className="band-dark text-background">
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16 lg:py-20">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="block text-2xl font-semibold leading-tight tracking-tight">
              NeverMinde
            </span>
            <span className="mt-1 block text-base leading-tight text-background/70">
              יקיר כהן
            </span>
            <p className="mt-5 max-w-xs leading-relaxed text-background/70">
              ניתוח לוגי של המציאות. הפרדה בין עובדה לבין סיפור, ללא דרמה.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-background/80 no-underline transition-colors duration-200 hover:text-background hover:no-underline"
              >
                וואטסאפ
              </a>
              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-background/80 no-underline transition-colors duration-200 hover:text-background hover:no-underline"
              >
                יוטיוב
              </a>
            </div>
          </div>

          <nav aria-label="ניווט תחתון">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-background/80 no-underline transition-colors duration-200 hover:text-background hover:no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-background/15 pt-6 text-sm text-background/60">
          © {currentYear} NeverMinde: יקיר כהן
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
