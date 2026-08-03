import type { BreadcrumbItem } from "@/lib/seo/breadcrumb-json-ld";

/** Hebrew labels for known path segments. */
const SEGMENT_LABELS: Record<string, string> = {
  videos: "וידאו",
  topics: "נושאים",
  articles: "מאמרים",
  concepts: "מושגים",
  mechanisms: "מנגנונים",
  members: "מועדון",
  paths: "מסלולים",
  contact: "יצירת קשר",
  books: "אהבה",
  booking: "תיאום",
  search: "חיפוש",
  "my-list": "הרשימה שלי",
  profile: "פרופיל",
  accessibility: "הצהרת נגישות",
  privacy: "מדיניות פרטיות",
  live: "שידור חי",
  watch: "צפייה",
  club: "מועדון",
  login: "התחברות",
  q: "הצעת מחיר",
};

function humanizeSegment(segment: string): string {
  const known = SEGMENT_LABELS[segment];
  if (known) return known;
  try {
    return decodeURIComponent(segment).replace(/[-_]+/g, " ");
  } catch {
    return segment.replace(/[-_]+/g, " ");
  }
}

/**
 * Build a visible breadcrumb trail from the current pathname.
 * Home is always first. Returns empty on `/`.
 */
export function buildTrailFromPathname(
  pathname: string,
  currentTitle?: string | null,
): BreadcrumbItem[] {
  const clean = pathname.split("?")[0]?.split("#")[0] ?? "/";
  if (!clean || clean === "/") return [];

  const parts = clean.split("/").filter(Boolean);
  if (parts.length === 0) return [];

  const items: BreadcrumbItem[] = [{ name: "בית", path: "/" }];
  let acc = "";

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    acc += `/${part}`;
    const isLast = i === parts.length - 1;

    // /watch/[id] → בית / וידאו / [title]
    if (parts[0] === "watch" && i === 0) {
      items.push({ name: "וידאו", path: "/videos" });
      continue;
    }
    if (parts[0] === "watch" && i === 1) {
      items.push({
        name: currentTitle?.trim() || "צפייה",
        path: acc,
      });
      continue;
    }

    // /articles/[slug] → בית / מאמרים / [title]
    if (parts[0] === "articles" && isLast && parts.length > 1) {
      items.push({
        name: currentTitle?.trim() || humanizeSegment(part),
        path: acc,
      });
      continue;
    }

    items.push({
      name:
        isLast && currentTitle?.trim()
          ? currentTitle.trim()
          : humanizeSegment(part),
      path: acc,
    });
  }

  return items;
}
