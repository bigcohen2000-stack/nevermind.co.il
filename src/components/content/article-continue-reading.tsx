"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  clearArticleReadPosition,
  loadArticleReadPosition,
  saveArticleReadPosition,
} from "@/lib/articles/read-position";

type ArticleContinueReadingProps = {
  slug: string;
  children: ReactNode;
};

/**
 * Scroll recovery for long articles via localStorage (`read_pos_[slug]`).
 * Shows a thin factual banner when a prior stop point exists.
 */
export function ArticleContinueReading({
  slug,
  children,
}: ArticleContinueReadingProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [resumeParagraph, setResumeParagraph] = useState<number | null>(null);
  const saveTimer = useRef<number | null>(null);

  const paragraphs = useCallback((): HTMLElement[] => {
    const root = rootRef.current;
    if (!root) return [];
    return Array.from(
      root.querySelectorAll<HTMLElement>("p, h2, h3, li"),
    ).filter((el) => (el.textContent?.trim().length ?? 0) > 40);
  }, []);

  const currentParagraphIndex = useCallback((): number => {
    const nodes = paragraphs();
    if (nodes.length === 0) return 1;
    const mid = window.scrollY + window.innerHeight * 0.35;
    let best = 1;
    for (let i = 0; i < nodes.length; i++) {
      const top = nodes[i].getBoundingClientRect().top + window.scrollY;
      if (top <= mid) best = i + 1;
      else break;
    }
    return best;
  }, [paragraphs]);

  useEffect(() => {
    const saved = loadArticleReadPosition(slug);
    if (saved && saved.paragraph >= 2) {
      setResumeParagraph(saved.paragraph);
    }
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      if (saveTimer.current != null) {
        window.clearTimeout(saveTimer.current);
      }
      saveTimer.current = window.setTimeout(() => {
        const paragraph = currentParagraphIndex();
        if (paragraph < 2) return;
        saveArticleReadPosition(slug, {
          paragraph,
          scrollY: Math.round(window.scrollY),
        });
      }, 400);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (saveTimer.current != null) {
        window.clearTimeout(saveTimer.current);
      }
    };
  }, [slug, currentParagraphIndex]);

  function resume() {
    if (resumeParagraph == null) return;
    const nodes = paragraphs();
    const target = nodes[resumeParagraph - 1];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    clearArticleReadPosition(slug);
    setResumeParagraph(null);
  }

  function dismiss() {
    clearArticleReadPosition(slug);
    setResumeParagraph(null);
  }

  return (
    <div ref={rootRef}>
      {resumeParagraph != null ? (
        <div
          className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-foreground/15 bg-paper px-4 py-3 text-sm"
          role="status"
        >
          <p className="text-foreground/80">
            זוהתה נקודת עצירה בפסקה {resumeParagraph}. לחץ להמשך קריאה.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={resume} className="btn btn-primary text-sm">
              המשך קריאה
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="btn btn-secondary text-sm"
            >
              התחל מההתחלה
            </button>
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
}
