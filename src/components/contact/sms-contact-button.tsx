"use client";

import { useState } from "react";

import { buildSmsHref, buildTelHref, getPhoneE164 } from "@/lib/whatsapp";

type SmsContactButtonProps = {
  message: string;
  /** Default: התחברות באמצעות SMS רגיל */
  label?: string;
  className?: string;
  /** Visual variant matching site buttons. */
  variant?: "secondary" | "on-dark";
  /** Optional hook before opening the SMS composer (e.g. lead logging). */
  onBeforeOpen?: () => void;
};

/**
 * Opens the device SMS composer with a prefilled access request.
 * On desktop (no SMS handler), shows the number + tel: fallback instead of a fake success.
 */
export function SmsContactButton({
  message,
  label = "התחברות באמצעות SMS רגיל",
  className = "btn btn-secondary",
  variant,
  onBeforeOpen,
}: SmsContactButtonProps) {
  const [hint, setHint] = useState("");
  const resolvedClass =
    variant === "on-dark" ? "btn btn-on-dark" : className;

  function onClick() {
    onBeforeOpen?.();
    const href = buildSmsHref(message);
    // Navigate into the SMS app. If nothing handles sms:, the page stays put.
    window.location.href = href;

    // Desktop / no handler: surface a dry fallback after a short beat.
    window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        setHint(
          `אם הודעת SMS לא נפתחה, שלחו ל-${getPhoneE164()} או התקשרו.`,
        );
      }
    }, 900);
  }

  return (
    <div>
      <button type="button" onClick={onClick} className={resolvedClass}>
        {label}
      </button>
      {hint ? (
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted" role="status">
          {hint}{" "}
          <a href={buildTelHref()} className="underline-offset-4 hover:underline">
            התקשרות
          </a>
          .
        </p>
      ) : null}
    </div>
  );
}
