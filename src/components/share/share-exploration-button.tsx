"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type ShareExplorationButtonProps = {
  /** Share title (video / article / page name). */
  title: string;
  /** Optional short share text. */
  text?: string;
  /** Absolute or site-relative URL. Defaults to the current page. */
  url?: string;
  className?: string;
};

type ShareStatus = "idle" | "copied" | "failed";

function resolveShareUrl(url?: string): string {
  if (url) {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (typeof window !== "undefined") {
      return new URL(url, window.location.origin).toString();
    }
    return url;
  }
  if (typeof window !== "undefined") return window.location.href;
  return "";
}

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to execCommand path.
  }

  try {
    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(input);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Native OS share sheet when available. Clipboard fallback otherwise.
 */
export function ShareExplorationButton({
  title,
  text = "חקירה מתוך NeverMinde",
  url,
  className = "",
}: ShareExplorationButtonProps) {
  const [status, setStatus] = useState<ShareStatus>("idle");

  async function onShare() {
    const shareUrl = resolveShareUrl(url);
    if (!shareUrl) {
      setStatus("failed");
      return;
    }

    const payload: ShareData = { title, text, url: shareUrl };

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        const canShare =
          typeof navigator.canShare !== "function" || navigator.canShare(payload);
        if (canShare) {
          await navigator.share(payload);
          setStatus("idle");
          return;
        }
      } catch (error) {
        // User dismissed the sheet: silent. Other errors: fall back to copy.
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    const copied = await copyToClipboard(shareUrl);
    setStatus(copied ? "copied" : "failed");
    window.setTimeout(() => setStatus("idle"), 2200);
  }

  return (
    <span className={cn("inline-flex flex-col items-start gap-1.5", className)}>
      <button
        type="button"
        onClick={() => void onShare()}
        className="btn btn-secondary"
      >
        שתף חקירה
      </button>
      <span className="sr-only" aria-live="polite">
        {status === "copied"
          ? "הקישור הועתק ללוח"
          : status === "failed"
            ? "לא ניתן לשתף כרגע"
            : ""}
      </span>
      {status === "copied" ? (
        <span className="text-xs text-muted" aria-hidden="true">
          הקישור הועתק
        </span>
      ) : null}
      {status === "failed" ? (
        <span className="text-xs text-muted" aria-hidden="true">
          לא ניתן לשתף כרגע
        </span>
      ) : null}
    </span>
  );
}
