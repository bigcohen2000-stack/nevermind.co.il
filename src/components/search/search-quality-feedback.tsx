"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { submitSearchFeedback } from "@/actions/search-analytics";
import {
  clearStoredSearchAnalyticsId,
  readStoredSearchAnalyticsId,
} from "@/lib/search/analytics-session";

type SearchQualityFeedbackProps = {
  searchQuery: string;
  /** Prefer server-finalized analytics id from the search results page. */
  analyticsId?: string | null;
};

/**
 * Subtle thumbs feedback under search results.
 * Updates search_analytics.user_feedback for this search.
 */
export function SearchQualityFeedback({
  searchQuery,
  analyticsId: analyticsIdProp,
}: SearchQualityFeedbackProps) {
  const query = searchQuery.trim();
  const [choice, setChoice] = useState<"up" | "down" | null>(null);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [analyticsId, setAnalyticsId] = useState<string | undefined>(
    analyticsIdProp ?? undefined,
  );

  useEffect(() => {
    if (!query) return;
    setAnalyticsId(
      analyticsIdProp ?? readStoredSearchAnalyticsId(query) ?? undefined,
    );
    setChoice(null);
    setNote("");
    setNoteSaved(false);
    setError("");
  }, [query, analyticsIdProp]);

  if (!query) return null;

  function sendFeedback(userFeedback: boolean, feedbackNote?: string) {
    setError("");
    startTransition(async () => {
      const result = await submitSearchFeedback({
        searchQuery: query,
        analyticsId,
        userFeedback,
        feedbackNote,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setAnalyticsId(result.id);
      clearStoredSearchAnalyticsId(query);

      if (userFeedback) {
        setChoice("up");
        setNoteSaved(false);
      } else if (feedbackNote?.trim()) {
        setChoice("down");
        setNoteSaved(true);
      } else {
        setChoice("down");
      }
    });
  }

  if (choice === "up" || (choice === "down" && noteSaved)) {
    return (
      <div
        className="mt-12 border-t border-foreground/10 pt-6 text-sm text-muted"
        role="status"
      >
        תודה על המשוב.
      </div>
    );
  }

  return (
    <div className="mt-12 border-t border-foreground/10 pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-foreground/70">מצאת את מה שחיפשת?</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={pending}
            onClick={() => sendFeedback(true)}
            className="inline-flex size-9 items-center justify-center text-muted transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action disabled:opacity-50"
            aria-label="כן, מצאתי"
          >
            <ThumbsUp className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setChoice("down");
              setError("");
              sendFeedback(false);
            }}
            className="inline-flex size-9 items-center justify-center text-muted transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action disabled:opacity-50"
            aria-label="לא מצאתי"
          >
            <ThumbsDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {choice === "down" && !noteSaved ? (
        <form
          className="mt-4 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            sendFeedback(false, note);
          }}
        >
          <label
            htmlFor="search-feedback-note"
            className="block text-sm text-foreground/70"
          >
            מה קיווית למצוא?
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="search-feedback-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              className="min-h-10 flex-1 border border-foreground/15 bg-transparent px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-action"
              placeholder="לא חובה"
            />
            <button
              type="submit"
              disabled={pending || !note.trim()}
              className="min-h-10 shrink-0 border border-foreground/15 px-3 text-sm text-foreground/80 transition hover:border-action hover:text-action disabled:cursor-not-allowed disabled:opacity-50"
            >
              שלח
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setNoteSaved(true)}
              className="min-h-10 shrink-0 px-2 text-sm text-muted transition hover:text-foreground"
            >
              דלג
            </button>
          </div>
        </form>
      ) : null}

      {error ? (
        <p className="mt-2 text-sm text-action" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
