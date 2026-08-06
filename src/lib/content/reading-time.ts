import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Hebrew reading pace for dry editorial pages. */
const HEBREW_WORDS_PER_MINUTE = 180;

/**
 * Strip MDX export metadata and light markdown so word count reflects prose.
 */
export function stripMdxForWordCount(source: string): string {
  let text = source.replace(
    /export\s+const\s+metadata\s*=\s*\{[\s\S]*?\};?\s*/m,
    " ",
  );
  text = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/^#{1,6}\s+/gm, " ")
    .replace(/[*_>~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function estimateReadingMinutesFromText(text: string): number {
  const words = countWords(text);
  if (words === 0) return 1;
  return Math.max(1, Math.ceil(words / HEBREW_WORDS_PER_MINUTE));
}

/**
 * Estimate minutes from the on-disk MDX source for a known article slug.
 * Safe on the server only (fs).
 */
export function getArticleReadingMinutes(slug: string): number {
  try {
    const filePath = join(
      process.cwd(),
      "content",
      "articles",
      `${slug}.mdx`,
    );
    const source = readFileSync(filePath, "utf8");
    return estimateReadingMinutesFromText(stripMdxForWordCount(source));
  } catch {
    return 1;
  }
}

/** Schema.org Duration, e.g. PT4M. */
export function readingMinutesToIsoDuration(minutes: number): string {
  const safe = Math.max(1, Math.round(minutes));
  return `PT${safe}M`;
}
