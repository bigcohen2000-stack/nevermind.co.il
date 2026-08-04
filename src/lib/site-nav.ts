/**
 * Crawlable site IA for header / footer / mobile drawer.
 * Primary links carry PageRank to content hubs. Account links stay secondary.
 * Emoji is visual-only (aria-hidden in UI). Link text stays Hebrew for SEO/AEO.
 */

export type NavLink = {
  label: string;
  href: string;
  /** Decorative emoji shown next to the Hebrew label. Not used in metadata. */
  emoji?: string;
};

/** Brand-facing primary destinations (header rail + mobile drawer). */
export const PRIMARY_NAV: NavLink[] = [
  { label: "וידאו", href: "/videos", emoji: "🎬" },
  { label: "מאמרים", href: "/articles", emoji: "📖" },
  { label: "מושגים", href: "/concepts", emoji: "💡" },
  { label: "מועדון", href: "/members", emoji: "🔑" },
  { label: "מסלולים", href: "/paths", emoji: "🧭" },
  { label: "יצירת קשר", href: "/contact", emoji: "✉️" },
];

/** Secondary hubs: "עוד" menu, footer, mobile drawer. */
export const SECONDARY_NAV: NavLink[] = [
  { label: "חיפוש", href: "/search", emoji: "🔍" },
  { label: "שידור חי", href: "/live", emoji: "📡" },
  { label: "מנגנונים", href: "/mechanisms", emoji: "⚙️" },
  { label: "תכנים", href: "/books", emoji: "📚" },
  { label: "תיאום", href: "/booking", emoji: "📅" },
  { label: "הרשימה שלי", href: "/my-list", emoji: "⭐" },
  { label: "פרופיל", href: "/profile", emoji: "👤" },
];

/** Legal / compliance links shown in footer bottom. */
export const LEGAL_NAV: NavLink[] = [
  { label: "מדיניות פרטיות", href: "/privacy", emoji: "🔒" },
  { label: "הצהרת נגישות", href: "/accessibility", emoji: "♿" },
  { label: "יצירת קשר", href: "/contact", emoji: "✉️" },
];

/** Full footer sitemap (primary first, then secondary). Deduped by href. */
export const FOOTER_NAV: NavLink[] = (() => {
  const seen = new Set<string>();
  const out: NavLink[] = [];
  for (const link of [
    { label: "ראשי", href: "/", emoji: "🏠" },
    ...PRIMARY_NAV,
    ...SECONDARY_NAV,
  ]) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    out.push(link);
  }
  return out;
})();

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
