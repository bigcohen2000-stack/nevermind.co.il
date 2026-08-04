"use client";

import { useState, type FormEvent } from "react";

import { buildWhatsAppHref, getWhatsAppNumber } from "@/lib/whatsapp";

type SearchMissedHelpProps = {
  searchQuery?: string;
  className?: string;
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * Help from Yakir when search misses: topic + questions open WhatsApp.
 */
export function SearchMissedHelp({
  searchQuery = "",
  className = "",
}: SearchMissedHelpProps) {
  const [topic, setTopic] = useState(searchQuery.trim());
  const [questions, setQuestions] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const topicValue = topic.trim();
    const questionsValue = questions.trim();

    if (!topicValue && !questionsValue) {
      setError("כתבו נושא או שאלות לפני השליחה.");
      return;
    }

    const phone = getWhatsAppNumber();
    if (!phone) {
      setError("מספר וואטסאפ לא מוגדר.");
      return;
    }

    setError("");
    const lines = [
      "היי יקיר, חיפשתי באתר ולא מצאתי.",
      topicValue ? `נושא: ${topicValue}` : null,
      questionsValue ? `שאלות: ${questionsValue}` : null,
      "אשמח לעזרה.",
    ].filter(Boolean);
    const url = buildWhatsAppHref(lines.join("\n"));
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <section
      aria-labelledby="search-missed-title"
      className={`border border-foreground/15 bg-paper p-5 sm:p-6 ${className}`}
    >
      <h2
        id="search-missed-title"
        className="text-base font-semibold tracking-tight text-foreground"
      >
        לא מצאתי את מה שחיפשתי
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        אפשר לבקש עזרה מיקיר בוואטסאפ. כתבו את הנושא ואת השאלות שלא מצאתם.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3" noValidate>
        <div>
          <label
            htmlFor="search-missed-topic"
            className="block text-xs font-medium text-foreground/80"
          >
            נושא
          </label>
          <input
            id="search-missed-topic"
            type="text"
            dir="rtl"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              if (error) setError("");
            }}
            className="mt-1.5 w-full border border-foreground/20 bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-action focus:ring-1 focus:ring-action"
            placeholder="למשל: חרדה, כעס, זוגיות"
          />
        </div>
        <div>
          <label
            htmlFor="search-missed-questions"
            className="block text-xs font-medium text-foreground/80"
          >
            שאלות / מה חיפשתם
          </label>
          <textarea
            id="search-missed-questions"
            rows={3}
            dir="rtl"
            value={questions}
            onChange={(e) => {
              setQuestions(e.target.value);
              if (error) setError("");
            }}
            className="mt-1.5 w-full resize-y border border-foreground/20 bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-action focus:ring-1 focus:ring-action"
            placeholder="מה רציתם למצוא ולא הופיע בתוצאות"
          />
        </div>

        {error ? (
          <p className="text-sm text-action" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-[#25D366] px-4 text-sm font-semibold text-black transition hover:opacity-90 sm:w-auto"
        >
          <WhatsAppIcon className="size-4 shrink-0" />
          בקשת עזרה בוואטסאפ
        </button>
      </form>
    </section>
  );
}
