"use client";

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

type HelpKind = "ios" | "generic";

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
 * Uses beforeinstallprompt when the browser offers it.
 * Otherwise opens factual install instructions (iOS Share or browser menu).
 * Hidden when already installed (standalone).
 * Manifest + existing /sw.js support installability without a full offline PWA stack.
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

  useEffect(() => {
    if (isStandaloneDisplay()) {
      setInstalled(true);
      setReady(true);
      return;
    }

    setHelpKind(isIosDevice() ? "ios" : "generic");

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    setReady(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const onInstallClick = useCallback(async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
      }
      setDeferred(null);
      return;
    }
    setHelpOpen(true);
  }, [deferred]);

  if (!ready || installed) return null;

  return (
    <>
      <button
        type="button"
        onClick={onInstallClick}
        className={cn(
          compact
            ? "inline-flex min-h-11 items-center justify-center border border-foreground/25 px-3 py-2 text-sm text-foreground transition hover:border-action hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
            : "btn btn-secondary",
          className,
        )}
        aria-label="הורדת אפליקציה: השם לא משנה"
      >
        הורדת אפליקציה
      </button>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-sm text-start" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {helpKind === "ios" ? "הוספה למסך הבית" : "התקנת האפליקציה"}
            </DialogTitle>
            <DialogDescription className="text-foreground/70">
              {helpKind === "ios"
                ? "ב-Safari: לחצו על שיתוף, ואז בחרו הוסף למסך הבית. כך נשארת גישה ל-השם לא משנה כמו אפליקציה."
                : "בדפדפן תומך: פתחו את תפריט הדפדפן ובחרו התקן אפליקציה או הוסף למסך הבית."}
            </DialogDescription>
          </DialogHeader>
          {helpKind === "ios" ? (
            <ol className="mt-2 list-decimal space-y-2 pe-5 text-sm leading-relaxed text-foreground/85">
              <li>לחצו על כפתור השיתוף בתחתית Safari.</li>
              <li>גללו ובחרו הוסף למסך הבית.</li>
              <li>אשרו את השם: השם לא משנה.</li>
            </ol>
          ) : (
            <ol className="mt-2 list-decimal space-y-2 pe-5 text-sm leading-relaxed text-foreground/85">
              <li>פתחו את תפריט הדפדפן (שלוש נקודות או שיתוף).</li>
              <li>בחרו התקן אפליקציה או הוסף למסך הבית.</li>
              <li>אשרו. האייקון יופיע במסך הבית.</li>
            </ol>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default InstallAppButton;
