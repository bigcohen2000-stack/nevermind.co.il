"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Clapperboard, Send } from "lucide-react";

import { submitLiveVideoRequest } from "@/actions/live-votes";
import { LIVE_TOPIC_WHATSAPP_TEXT } from "@/lib/live/schedule";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type LiveRequestFormProps = {
  isAuthenticated: boolean;
  /** Prefill when requesting a specific archive card. */
  defaultTitle?: string;
  defaultVideoId?: string;
  className?: string;
};

/**
 * Request a specific video / topic for a future LIVE.
 */
export function LiveRequestForm({
  isAuthenticated,
  defaultTitle = "",
  defaultVideoId,
  className,
}: LiveRequestFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(defaultTitle);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const whatsappHref = buildWhatsAppHref(
    `${LIVE_TOPIC_WHATSAPP_TEXT}${title.trim() || "..."}${note.trim() ? `\n\n${note.trim()}` : ""}`,
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(false);

    if (!isAuthenticated) {
      setError("צריך להירשם או להתחבר כדי לשלוח בקשה מהאתר.");
      return;
    }

    startTransition(async () => {
      const result = await submitLiveVideoRequest({
        videoTitle: title,
        note,
        videoId: defaultVideoId,
      });
      if (!result.ok) {
        setError(result.error);
        if (result.needsAuth) router.refresh();
        return;
      }
      setDone(true);
      setNote("");
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className={cn("space-y-4 border border-foreground/12 bg-paper p-5", className)}
      aria-labelledby="live-request-title"
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center border border-foreground/15 text-action"
          aria-hidden
        >
          <Clapperboard className="size-4" strokeWidth={1.75} />
        </span>
        <div>
          <h3
            id="live-request-title"
            className="text-base font-semibold tracking-tight"
          >
            הזמנת סרטון ללייב
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-foreground/70">
            רוצים שנעלה סרטון ספציפי בלייב? כתבו את השם. אפשר גם לצרף הערה קצרה.
          </p>
        </div>
      </div>

      <label className="block text-sm">
        <span className="text-foreground/80">שם הסרטון או הנושא</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="mt-1.5 w-full border border-foreground/20 bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
          placeholder="לדוגמה: סרטון על הזדהות"
        />
      </label>

      <label className="block text-sm">
        <span className="text-foreground/80">הערה (אופציונלי)</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={3}
          className="mt-1.5 w-full resize-y border border-foreground/20 bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
          placeholder="למה זה מעניין, או באיזה לייב תרצו"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending || !title.trim()}
          className="btn btn-primary text-sm disabled:opacity-50"
        >
          <Send className="size-3.5" aria-hidden />
          {pending ? "שולח..." : "שליחת בקשה"}
        </button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary text-sm"
        >
          וואטסאפ
        </a>
        {!isAuthenticated ? (
          <Link href="/live#live-auth" className="btn btn-secondary text-sm">
            התחברות
          </Link>
        ) : null}
      </div>

      {done ? (
        <p className="text-sm text-foreground/75" role="status">
          הבקשה נקלטה. נבדוק. אין הבטחה לתאריך.
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-action" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
