"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * SiteHeader — sticky, translucent RTL site header.
 * Primary nav focuses on live content surfaces; search stays available,
 * members stays out of the main bar until active.
 */

const navLinks = [
  { label: "ראשי", href: "/" },
  { label: "מסלולים", href: "/paths" },
  { label: "מאמרים", href: "/articles" },
  { label: "מנגנונים", href: "/mechanisms" },
  { label: "וידאו", href: "/videos" },
  { label: "תכנים", href: "/books" },
  { label: "יצירת קשר", href: "/contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <Link
          href="/"
          className="text-foreground no-underline hover:no-underline"
        >
          <span className="block text-lg font-semibold leading-tight tracking-tight">
            NeverMinde
          </span>
          <span className="block text-sm leading-tight text-muted">
            יקיר כהן
          </span>
        </Link>

        <nav aria-label="ניווט ראשי">
          <ul className="-me-2 flex flex-wrap items-center gap-x-1 gap-y-1 text-sm sm:gap-x-2">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className="nav-link inline-block rounded-md px-2 py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default SiteHeader;
