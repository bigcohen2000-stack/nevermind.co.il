"use client";

import {
  BookOpen,
  Calendar,
  Clapperboard,
  Compass,
  Home,
  KeyRound,
  Library,
  Lightbulb,
  Mail,
  Menu,
  MoreHorizontal,
  Radio,
  Search,
  Settings2,
  Bookmark,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { AccessUpgradeStrip } from "@/components/access/access-upgrade-strip";
import { HeaderAuthControls } from "@/components/layout/header-auth-controls";
import { HeaderSearch } from "@/components/layout/header-search";
import { InstallAppButton } from "@/components/layout/install-app-button";
import { SiteLogo } from "@/components/layout/site-logo";
import { useStickyChromeLock } from "@/components/layout/sticky-site-chrome";
import { useCommandPaletteOptional } from "@/components/search/command-palette-context";
import type { HeaderSession } from "@/lib/auth/header-session-shared";
import type { SiteAccessTier } from "@/lib/access/site-tier";
import {
  isNavActive,
  PRIMARY_NAV,
  SECONDARY_NAV,
} from "@/lib/site-nav";
import type { SiteTheme } from "@/lib/theme/theme";
import { cn } from "@/lib/utils";
import { ClubMemberChrome } from "@/components/layout/club-member-chrome";

type SiteHeaderProps = {
  session: HeaderSession;
  theme: SiteTheme;
  accessTier?: SiteAccessTier;
};

const NAV_ICONS: Record<string, LucideIcon> = {
  "/": Home,
  "/videos": Clapperboard,
  "/articles": BookOpen,
  "/concepts": Lightbulb,
  "/members": KeyRound,
  "/paths": Compass,
  "/contact": Mail,
  "/search": Search,
  "/mechanisms": Settings2,
  "/books": Library,
  "/booking": Calendar,
  "/live": Radio,
  "/my-list": Bookmark,
  "/profile": User,
};

function NavIcon({ href }: { href: string }) {
  const Icon = NAV_ICONS[href];
  if (!Icon) return null;
  return <Icon className="me-1.5 h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />;
}

function HeaderSearchCluster({
  expanded = false,
  onNavigate,
  className,
}: {
  expanded?: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2",
        expanded ? "w-full" : "w-full max-w-md",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <HeaderSearch expanded={expanded} onNavigate={onNavigate} />
      </div>
      <Link
        href="/search"
        onClick={onNavigate}
        className={cn(
          "inline-flex shrink-0 items-center justify-center gap-1.5 border border-foreground/20 text-sm text-foreground transition",
          "hover:border-action hover:text-action",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
          expanded ? "min-h-11 px-3" : "min-h-10 min-w-10 px-2.5",
        )}
        aria-label="לעמוד החיפוש"
        title="עמוד חיפוש"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        {expanded ? <span>חיפוש</span> : null}
      </Link>
    </div>
  );
}

function DesktopMoreMenu() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const anyActive = SECONDARY_NAV.some((l) => isNavActive(pathname, l.href));
  const menuWidth = 224;

  useStickyChromeLock(open);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      setMenuPos(null);
      return;
    }

    function place() {
      const btn = rootRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const left = Math.min(
        Math.max(8, r.right - menuWidth),
        window.innerWidth - menuWidth - 8,
      );
      setMenuPos({ top: r.bottom + 6, left });
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
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
        <MoreHorizontal className="me-1.5 h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
        עוד
      </button>
      {open && menuPos ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          className="fixed z-[80] border border-foreground/20 bg-background p-1.5"
          style={{
            top: menuPos.top,
            left: menuPos.left,
            width: menuWidth,
          }}
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
                  "flex min-h-10 items-center px-3 text-sm text-foreground transition hover:bg-paper hover:text-action",
                  active && "bg-paper text-action",
                )}
                onClick={() => setOpen(false)}
              >
                <NavIcon href={link.href} />
                {link.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  expanded,
  controls,
  children,
}: {
  label: string;
  onClick: () => void;
  expanded?: boolean;
  controls?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="inline-flex min-h-11 min-w-11 items-center justify-center border border-foreground/20 text-foreground transition hover:border-action hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
      aria-expanded={expanded}
      aria-controls={controls}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/**
 * Sticky RTL header: brand + search on top, nav rail on wide screens.
 * Lucide icons only. Auth + install app on the trailing side.
 */
export function SiteHeader({
  session,
  theme,
  accessTier = "guest",
}: SiteHeaderProps) {
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const panelId = useId();
  const isClub = accessTier === "club";
  const commandPalette = useCommandPaletteOptional();

  useStickyChromeLock(menuOpen || mobileSearchOpen);

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
    if (menuOpen || mobileSearchOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen, mobileSearchOpen]);

  function openMobileSearch() {
    if (commandPalette) {
      setMenuOpen(false);
      setMobileSearchOpen(false);
      commandPalette.openPalette();
      return;
    }
    setMobileSearchOpen((v) => !v);
    setMenuOpen(false);
  }

  return (
    <header
      className={cn(
        "border-b",
        isClub
          ? "border-action/25 bg-background"
          : "border-foreground/10 bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/65",
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 py-3 lg:gap-6 lg:py-3.5">
          <SiteLogo
            variant={theme === "dark" ? "on-dark" : "on-light"}
            size="header"
            priority
          />

          <div className="hidden min-w-0 flex-1 lg:block">
            <HeaderSearchCluster />
          </div>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            {isClub ? <ClubMemberChrome variant="chip" /> : null}
            {accessTier === "account" ? (
              <span className="hidden items-center border border-foreground/20 bg-paper px-2.5 py-1 text-[11px] font-medium tracking-wide text-foreground/80 xl:inline-flex">
                חשבון במייל
              </span>
            ) : null}
            {!isClub ? (
              <AccessUpgradeStrip
                tier={accessTier}
                density="header"
                hideStatus
              />
            ) : null}
            <HeaderAuthControls
              session={session}
              theme={theme}
              accessTier={accessTier}
            />
            <InstallAppButton compact />
          </div>

          <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
            {isClub ? <ClubMemberChrome variant="chip" /> : null}
            <IconButton
              label="פתיחת חיפוש"
              expanded={mobileSearchOpen}
              onClick={openMobileSearch}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            <HeaderAuthControls
              session={session}
              theme={theme}
              accessTier={accessTier}
              compact
            />
            <IconButton
              label={menuOpen ? "סגירת תפריט" : "פתיחת תפריט"}
              expanded={menuOpen}
              controls={panelId}
              onClick={() => {
                setMenuOpen((v) => !v);
                setMobileSearchOpen(false);
              }}
            >
              {menuOpen ? (
                <X className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4" aria-hidden="true" />
              )}
            </IconButton>
          </div>
        </div>

        <nav
          aria-label="ניווט ראשי"
          className="hidden border-t border-foreground/10 lg:block"
        >
          <div className="flex flex-wrap items-center justify-start gap-0.5 py-2">
            <ul className="flex flex-wrap items-center gap-0.5">
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
                      <NavIcon href={link.href} />
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
          <HeaderSearchCluster
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
            <HeaderSearchCluster
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
                    <NavIcon href="/" />
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
                        <NavIcon href={link.href} />
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
                        <NavIcon href={link.href} />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <HeaderAuthControls
              session={session}
              theme={theme}
              accessTier={accessTier}
              layout="stack"
              onNavigate={() => setMenuOpen(false)}
            />

            {!isClub ? (
              <div className="border-t border-foreground/10 pt-4">
                <AccessUpgradeStrip tier={accessTier} density="section" />
              </div>
            ) : null}

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
