"use client";

import { useState } from "react";

import { buildSmsHref, buildWhatsAppHref } from "@/lib/whatsapp";

type WhatsAppTrackCtaProps = {
  /** Prefill body for WhatsApp / SMS. */
  message: string;
  /** Primary button label. */
  label: string;
  /** Show SMS sibling for kosher phones. Default true. */
  showSms?: boolean;
  /** Light = paper bg. Dark = ink footer surfaces. */
  tone?: "light" | "dark";
  className?: string;
};

const primaryBtnClass =
  "inline-flex min-h-12 w-full items-center justify-center rounded-none border border-[#D42B2B] bg-[#D42B2B] px-5 py-3 text-sm font-medium text-white shadow-none transition hover:bg-[#B82424] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D42B2B] sm:w-auto";

const secondaryBtnLight =
  "inline-flex min-h-12 w-full items-center justify-center rounded-none border border-[#1A1A1A] bg-transparent px-5 py-3 text-sm font-medium text-[#1A1A1A] shadow-none transition hover:bg-[#1A1A1A]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A] sm:w-auto";

const secondaryBtnDark =
  "inline-flex min-h-12 w-full items-center justify-center rounded-none border border-[#FAFAF8] bg-transparent px-5 py-3 text-sm font-medium text-[#FAFAF8] shadow-none transition hover:bg-[#FAFAF8]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FAFAF8] sm:w-auto";

/**
 * Local success status, then open WhatsApp (and optional SMS).
 * No checkout. Phone-first routing only.
 */
export function WhatsAppTrackCta({
  message,
  label,
  showSms = true,
  tone = "light",
  className = "",
}: WhatsAppTrackCtaProps) {
  const [status, setStatus] = useState("");
  const secondaryBtnClass =
    tone === "dark" ? secondaryBtnDark : secondaryBtnLight;
  const statusClass =
    tone === "dark" ? "text-[#9CA3AF]" : "text-[#9CA3AF]";

  function openChannel(kind: "whatsapp" | "sms") {
    setStatus(
      kind === "whatsapp"
        ? "הבקשה נקלטה. פותח וואטסאפ."
        : "הבקשה נקלטה. פותח SMS.",
    );
    const href =
      kind === "whatsapp"
        ? buildWhatsAppHref(message)
        : buildSmsHref(message);

    window.setTimeout(() => {
      if (kind === "whatsapp") {
        window.open(href, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = href;
      }
    }, 400);
  }

  return (
    <div className={className}>
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => openChannel("whatsapp")}
          className={primaryBtnClass}
        >
          {label}
        </button>
        {showSms ? (
          <button
            type="button"
            onClick={() => openChannel("sms")}
            className={secondaryBtnClass}
          >
            SMS רגיל
          </button>
        ) : null}
      </div>
      {status ? (
        <p className={`mt-3 text-sm ${statusClass}`} role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
