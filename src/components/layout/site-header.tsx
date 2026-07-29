"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * SiteHeader — sticky, translucent RTL site header (Design v1 polish).
 *
 * Text-based wordmark plus primary navigation. Sticks to the top with a subtle
 * blurred off-white backdrop and a hairline border, so it reads as premium over
 * both light and dark bands. The current route is marked with `aria-current`
 * and the red accent. Mobile-first: wordmark and nav stack on small screens and
 * sit side by side from `sm` up. No shadows, gradients, animations beyond a
 * flat color change, or external icons.
 */

const navLinks = [
  { label: "ראשי", href: "/" },
  { label: "מאמרים", href: "/articles" },
  { label: "מנגנונים", href: "/mechanisms" },
  { label: "וידאו", href: "/videos" },
  { label: "חברים", href: "/members" },
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
