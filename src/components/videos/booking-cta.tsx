"use client";

import { useEffect, useId, useState } from "react";

import { buildWhatsAppHref } from "@/lib/whatsapp";

type BookingCtaProps = {
  topic: string;
};

/**
 * Dynamic scheduling CTA under the watch player.
 * Opens a lightweight modal: WhatsApp and optional schedule URL.
 */
export function BookingCta({ topic }: BookingCtaProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const scheduleUrl = process.env.NEXT_PUBLIC_SCHEDULE_URL?.trim();
  const whatsappHref = buildWhatsAppHref(
    `שלום, אשמח לתאם שיחה על הנושא: ${topic}`,
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <aside
        className="border border-action/40 bg-paper p-6 sm:p-8"
        aria-labelledby={titleId}
      >
        <p id={titleId} className="text-xs font-medium tracking-wide text-action">
          תיאום שיחה
        </p>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-foreground sm:text-lg">
          אם תרצה לדבר יותר על רעיונות נוספים בנושא{" "}
          <span className="font-semibold">{topic}</span>, ניתן ללחוץ כאן ולתאם
          פגישה.
        </p>
        <button
          type="button"
          className="btn btn-primary mt-6"
          onClick={() => setOpen(true)}
        >
          לתיאום פגישה
        </button>
      </aside>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${titleId}-dialog`}
            className="relative w-full max-w-md border border-foreground/15 bg-background p-6 text-foreground shadow-float"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 end-3 inline-flex size-9 items-center justify-center text-muted hover:text-foreground"
              aria-label="סגור"
              onClick={() => setOpen(false)}
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ×
              </span>
            </button>

            <h2
              id={`${titleId}-dialog`}
              className="pe-10 text-xl font-semibold tracking-tight"
            >
              תיאום פגישה
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/75">
              נושא: {topic}
            </p>

            <ul className="mt-6 space-y-3">
              <li>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full"
                >
                  המשך בוואטסאפ
                </a>
              </li>
              {scheduleUrl ? (
                <li>
                  <a
                    href={scheduleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary w-full"
                  >
                    יומן תיאום
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
