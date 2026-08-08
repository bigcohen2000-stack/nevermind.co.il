"use client";

import Image from "next/image";
import { Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallAppButtonProps = {
  className?: string;
  /** Compact control for tight header rows. */
  compact?: boolean;
};

type HelpKind = "ios" | "android-prompt" | "generic" | "installed";

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const media = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return media || iosStandalone;
}

/**
 * "הורדת אפליקציה" for השם לא משנה.
 * Hidden when already installed (standalone / appinstalled).
 */
export function InstallAppButton({
  className,
  compact = false,
}: InstallAppButtonProps) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpKind, setHelpKind] = useState<HelpKind>("generic");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay()) {
      setInstalled(true);
      setHelpKind("installed");
      setReady(true);
      return;
    }

    setHelpKind(isIosDevice() ? "ios" : "generic");

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setHelpKind("android-prompt");
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      setHelpKind("installed");
      setHelpOpen(false);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    setReady(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const onInstallClick = useCallback(() => {
    if (isIosDevice()) {
      setHelpKind("ios");
    } else if (deferred) {
      setHelpKind("android-prompt");
    } else {
      setHelpKind("generic");
    }
    setHelpOpen(true);
  }, [deferred]);

  const onNativeInstall = useCallback(async () => {
    if (!deferred || busy) return;
    setBusy(true);
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
        setHelpKind("installed");
        setHelpOpen(false);
      }
      setDeferred(null);
    } finally {
      setBusy(false);
    }
  }, [busy, deferred]);

  if (!ready) {
    return null;
  }

  if (installed) {
    return null;
  }

  const title =
    helpKind === "ios"
      ? "הוספה למסך הבית"
      : helpKind === "android-prompt"
        ? "התקנה למסך הבית"
        : "איך מתקינים";

  return (
    <>
      <button
        type="button"
        onClick={onInstallClick}
        className={cn(
          compact
            ? "inline-flex min-h-10 items-center justify-center gap-1.5 border border-foreground/25 bg-paper px-3 text-sm font-medium text-foreground transition hover:border-action hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
            : "btn btn-secondary inline-flex items-center justify-center gap-2 font-medium",
          className,
        )}
        aria-label="הורדת אפליקציה: השם לא משנה"
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className={compact ? "hidden xl:inline" : undefined}>
          הורדת אפליקציה
        </span>
        {compact ? (
          <span className="xl:hidden">אפליקציה</span>
        ) : null}
      </button>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent
          className="max-w-sm border-[#FAFAF8]/20 bg-[#0A0A0B] text-[#FAFAF8] text-start"
          dir="rtl"
        >
          <DialogHeader>
            <div className="mb-3 flex items-center gap-3">
              <span className="relative size-14 shrink-0 overflow-hidden border border-[#FAFAF8]/20 bg-black">
                <Image
                  src="/icons/icon-192.png"
                  alt=""
                  width={56}
                  height={56}
                  className="size-full object-cover"
                />
              </span>
              <div className="min-w-0">
                <p className="text-xs tracking-[0.14em] text-[#9CA3AF] uppercase">
                  אפליקציה מקומית
                </p>
                <p className="mt-1 text-base font-semibold tracking-tight text-[#FAFAF8]">
                  השם לא משנה
                </p>
              </div>
            </div>
            <DialogTitle className="text-[#FAFAF8]">{title}</DialogTitle>
            <DialogDescription className="text-[#9CA3AF]">
              {helpKind === "ios"
                ? "ב-Safari מוסיפים את האתר למסך הבית. האייקון נשאר כמו אפליקציה מקומית, בלי חנות."
                : helpKind === "android-prompt"
                  ? "לחיצה אחת פותחת את חלון ההתקנה של הדפדפן. האייקון יופיע במסך הבית."
                  : "בדפדפן תומך בוחרים התקן אפליקציה או הוסף למסך הבית. האייקון יופיע במסך הבית."}
            </DialogDescription>
          </DialogHeader>

          {helpKind === "android-prompt" ? (
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={onNativeInstall}
                disabled={busy}
                className="btn btn-primary w-full disabled:opacity-60"
              >
                {busy ? "פותח התקנה..." : "התקן עכשיו"}
              </button>
              <p className="text-xs leading-relaxed text-[#9CA3AF]">
                אם החלון של הדפדפן לא מופיע, סגרו ופתחו שוב את תפריט הדפדפן:
                התקן אפליקציה.
              </p>
            </div>
          ) : helpKind === "ios" ? (
            <ol className="mt-4 list-decimal space-y-2 pe-5 text-sm leading-relaxed text-[#FAFAF8]/85">
              <li>לחצו על כפתור השיתוף בתחתית Safari.</li>
              <li>גללו ובחרו הוסף למסך הבית.</li>
              <li>אשרו את השם: השם לא משנה.</li>
            </ol>
          ) : (
            <ol className="mt-4 list-decimal space-y-2 pe-5 text-sm leading-relaxed text-[#FAFAF8]/85">
              <li>פתחו את תפריט הדפדפן (שלוש נקודות).</li>
              <li>בחרו התקן אפליקציה או הוסף למסך הבית.</li>
              <li>אשרו. האייקון של השם לא משנה יופיע במסך הבית.</li>
            </ol>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default InstallAppButton;
