"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

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
    <span aria-hidden="true" className="me-1.5 select-none text-[0.95em]">
      {emoji}
    </span>
  );
}

function DesktopMoreMenu() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const anyActive = SECONDARY_NAV.some((l) => isNavActive(pathname, l.href));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className={cn("nav-pill", anyActive && "nav-pill-active")}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true" className="me-1.5">
          ···
        </span>
        עוד
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute end-0 z-[60] mt-2 min-w-[14rem] border border-foreground/15 bg-background p-1.5 shadow-float"
        >
          {SECONDARY_NAV.map((link) => {
            const active = isNavActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                role="menuitem"
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-10 items-center rounded-md px-3 text-sm transition hover:bg-paper",
                  active ? "text-action" : "text-foreground/90",
                )}
                onClick={() => setOpen(false)}
              >
                <NavEmoji emoji={link.emoji} />
                {link.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Sticky RTL header: brand + search on top, modern nav rail on wide screens.
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
    <header className="border-b border-foreground/10 bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 py-3 lg:gap-6 lg:py-3.5">
          <SiteLogo variant="on-dark" size="header" priority />

          <div className="hidden min-w-0 flex-1 lg:block">
            <HeaderSearch />
          </div>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <HeaderAuthControls session={session} />
            <InstallAppButton compact />
          </div>

          <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-foreground/20 text-foreground transition hover:border-action hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
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
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-foreground/20 text-foreground transition hover:border-action hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
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

        <nav
          aria-label="ניווט ראשי"
          className="hidden border-t border-foreground/10 lg:block"
        >
          <div className="flex items-center gap-1 py-2">
            <ul className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {PRIMARY_NAV.map((link) => {
                const active = isNavActive(pathname, link.href);
                return (
                  <li key={link.href} className="shrink-0">
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      aria-label={link.label}
                      className={cn("nav-pill", active && "nav-pill-active")}
                    >
                      <NavEmoji emoji={link.emoji} />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <DesktopMoreMenu />
          </div>
        </nav>
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
          <div className="mx-auto flex max-h-[min(80vh,36rem)] w-full max-w-7xl flex-col gap-6 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
            <HeaderSearch expanded onNavigate={() => setMenuOpen(false)} />

            <nav aria-label="ניווט ראשי מובייל">
              <ul className="flex flex-col gap-1">
                <li>
                  <Link
                    href="/"
                    aria-current={pathname === "/" ? "page" : undefined}
                    aria-label="ראשי"
                    className="nav-link flex min-h-12 items-center rounded-md px-2 text-base font-medium"
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
                        className="nav-link flex min-h-12 items-center rounded-md px-2 text-base"
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
                        className="nav-link flex min-h-11 items-center rounded-md px-2 text-sm text-foreground/85"
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
