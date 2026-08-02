"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { HeaderAuthControls } from "@/components/layout/header-auth-controls";
import { HeaderSearch } from "@/components/layout/header-search";
import { InstallAppButton } from "@/components/layout/install-app-button";
import { SiteLogo } from "@/components/layout/site-logo";
import type { HeaderSession } from "@/lib/auth/header-session-shared";
import {
  isNavActive,
  PRIMARY_NAV,
  SECONDARY_NAV,
} from "@/lib/site-nav";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  session: HeaderSession;
};

function NavEmoji({ emoji }: { emoji?: string }) {
  if (!emoji) return null;
  return (
    <span aria-hidden="true" className="me-1.5 select-none">
      {emoji}
    </span>
  );
}

/**
 * Sticky RTL header: brand, compact search, crawlable nav with Hebrew emoji,
 * auth entry, install CTA, and mobile drawer.
 */
export function SiteHeader({ session }: SiteHeaderProps) {
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    setMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen && !mobileSearchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen, mobileSearchOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
        <SiteLogo variant="on-dark" size="header" priority />

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 lg:flex">
          <HeaderSearch />
          <nav aria-label="ניווט ראשי" className="min-w-0">
            <ul className="flex flex-wrap items-center justify-end gap-x-0.5 gap-y-1 text-sm">
              {PRIMARY_NAV.map((link) => {
                const active = isNavActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      aria-label={link.label}
                      className="nav-link inline-flex min-h-11 items-center rounded-md px-2 py-2 xl:px-2.5"
                    >
                      <NavEmoji emoji={link.emoji} />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <HeaderAuthControls session={session} />
          <InstallAppButton compact />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center border border-foreground/20 text-foreground transition hover:border-action hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
            aria-expanded={mobileSearchOpen}
            aria-label={mobileSearchOpen ? "סגירת חיפוש" : "פתיחת חיפוש"}
            onClick={() => {
              setMobileSearchOpen((v) => !v);
              setMenuOpen(false);
            }}
          >
            <span aria-hidden="true">🔍</span>
          </button>
          <HeaderAuthControls session={session} compact />
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center border border-foreground/20 text-foreground transition hover:border-action hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
            aria-expanded={menuOpen}
            aria-controls={panelId}
            aria-label={menuOpen ? "סגירת תפריט" : "פתיחת תפריט"}
            onClick={() => {
              setMenuOpen((v) => !v);
              setMobileSearchOpen(false);
            }}
          >
            <span className="sr-only">{menuOpen ? "סגור" : "תפריט"}</span>
            <span aria-hidden="true" className="flex flex-col gap-1.5">
              <span
                className={cn(
                  "block h-0.5 w-5 bg-current transition",
                  menuOpen && "translate-y-2 rotate-45",
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 bg-current transition",
                  menuOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 bg-current transition",
                  menuOpen && "-translate-y-2 -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {mobileSearchOpen ? (
        <div className="border-t border-foreground/10 bg-background px-4 py-3 lg:hidden sm:px-6">
          <HeaderSearch
            expanded
            onNavigate={() => setMobileSearchOpen(false)}
          />
        </div>
      ) : null}

      {menuOpen ? (
        <div
          id={panelId}
          className="border-t border-foreground/10 bg-background lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="תפריט אתר"
        >
          <div className="mx-auto flex max-h-[min(80vh,36rem)] w-full max-w-6xl flex-col gap-6 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
            <HeaderSearch
              expanded
              onNavigate={() => setMenuOpen(false)}
            />

            <nav aria-label="ניווט ראשי מובייל">
              <ul className="flex flex-col gap-1">
                <li>
                  <Link
                    href="/"
                    aria-current={pathname === "/" ? "page" : undefined}
                    aria-label="ראשי"
                    className="nav-link flex min-h-12 items-center px-2 text-base font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    <NavEmoji emoji="🏠" />
                    ראשי
                  </Link>
                </li>
                {PRIMARY_NAV.map((link) => {
                  const active = isNavActive(pathname, link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        aria-label={link.label}
                        className="nav-link flex min-h-12 items-center px-2 text-base"
                        onClick={() => setMenuOpen(false)}
                      >
                        <NavEmoji emoji={link.emoji} />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <nav aria-label="עמודים נוספים">
              <p className="px-2 text-xs font-medium tracking-wide text-muted">
                עוד
              </p>
              <ul className="mt-2 flex flex-col gap-1">
                {SECONDARY_NAV.map((link) => {
                  const active = isNavActive(pathname, link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        aria-label={link.label}
                        className="nav-link flex min-h-11 items-center px-2 text-sm text-foreground/85"
                        onClick={() => setMenuOpen(false)}
                      >
                        <NavEmoji emoji={link.emoji} />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <HeaderAuthControls
              session={session}
              layout="stack"
              onNavigate={() => setMenuOpen(false)}
            />

            <div className="border-t border-foreground/10 pt-4">
              <InstallAppButton className="w-full" />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default SiteHeader;
