"use client";

import Image from "next/image";
import Link from "next/link";

import type { GatedBonusVideo } from "@/actions/premium";
import { ArchiveTierPicker } from "@/components/premium/archive-tier-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ACCESS_GATE_DESCRIPTION,
  ACCESS_GATE_DISMISS_CTA,
  ACCESS_GATE_DISMISS_NOTE,
  ACCESS_GATE_PATHS_NOTE,
  ACCESS_GATE_PRIMARY_CTA,
  ACCESS_GATE_PRIMARY_WHATSAPP,
  ACCESS_GATE_SECONDARY_CTA,
  ACCESS_GATE_SECONDARY_WHATSAPP,
  ACCESS_GATE_TITLE,
} from "@/lib/premium/access-gate-copy";
import { dismissAccessGate } from "@/lib/premium/watch-count-local";
import { getWatchHref } from "@/lib/videos/watch-path";
import { buildWhatsAppHref } from "@/lib/whatsapp";

type FreeProps = {
  mode: "free";
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type PremiumProps = {
  mode: "premium";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videos: GatedBonusVideo[];
};

export type DeepRabbitHoleProps = FreeProps | PremiumProps;

function closeAndCap(onOpenChange: (open: boolean) => void) {
  dismissAccessGate();
  onOpenChange(false);
}

/**
 * Access gate interstitial (zero drama):
 * - Free: factual authorization modal after gated search intent or watch threshold.
 * - Premium: related authorized videos + optional 1:1 deepen CTA (no FOMO copy).
 */
export function DeepRabbitHole(props: DeepRabbitHoleProps) {
  if (props.mode === "free") {
    const primaryHref = buildWhatsAppHref(ACCESS_GATE_PRIMARY_WHATSAPP);
    const secondaryHref = buildWhatsAppHref(ACCESS_GATE_SECONDARY_WHATSAPP);

    return (
      <Dialog
        open={props.open}
        onOpenChange={(next) => {
          if (!next) dismissAccessGate();
          props.onOpenChange(next);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-h-[min(92vh,44rem)] max-w-lg overflow-y-auto rounded-none border-foreground/20 bg-background p-0 text-foreground shadow-none duration-0 data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100"
          overlayClassName="bg-black/40 backdrop-blur-sm duration-0"
          aria-describedby="access-gate-desc"
        >
          <div className="p-6 sm:p-8" dir="rtl">
            <DialogHeader className="pe-0">
              <DialogTitle className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {ACCESS_GATE_TITLE}
              </DialogTitle>
              <DialogDescription
                id="access-gate-desc"
                className="mt-4 text-sm leading-relaxed text-muted sm:text-base"
              >
                {ACCESS_GATE_DESCRIPTION}
              </DialogDescription>
            </DialogHeader>

            <ArchiveTierPicker
              className="mt-6"
              density="compact"
              onRequest={() => dismissAccessGate()}
            />

            <p className="mt-3 text-xs leading-relaxed text-muted">
              {ACCESS_GATE_PATHS_NOTE}{" "}
              <Link
                href="/paths"
                className="text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                onClick={() => closeAndCap(props.onOpenChange)}
              >
                לעמוד המסלולים
              </Link>
              .
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <a
                href={primaryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-none border border-[#1A1A1A] bg-transparent px-4 text-sm font-semibold text-[#1A1A1A] transition hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                onClick={() => dismissAccessGate()}
              >
                {ACCESS_GATE_PRIMARY_CTA}
              </a>
              <a
                href={secondaryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-none border border-[#1A1A1A] bg-transparent px-4 text-sm font-semibold text-[#1A1A1A] transition hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                onClick={() => dismissAccessGate()}
              >
                {ACCESS_GATE_SECONDARY_CTA}
              </a>
              <button
                type="button"
                className="min-h-11 w-full rounded-none px-4 text-sm text-muted underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                onClick={() => closeAndCap(props.onOpenChange)}
              >
                {ACCESS_GATE_DISMISS_CTA}
              </button>
              <p className="text-center text-xs leading-relaxed text-muted">
                {ACCESS_GATE_DISMISS_NOTE}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const count = props.videos.length;
  const oneOnOneHref = buildWhatsAppHref(ACCESS_GATE_SECONDARY_WHATSAPP);

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-md rounded-none border-white/10 bg-[#0A0A0B] p-6 shadow-none sm:p-8"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            סרטונים נוספים במאגר המורשה
          </DialogTitle>
          <DialogDescription className="mt-3 text-sm leading-relaxed text-[#9CA3AF]">
            {count > 0
              ? `נמצאו ${count} סרטונים מורשים הקשורים לנושא שצפית בו. אפשר לצפות בהם ישירות, או לתאם פגישת 1:1 להעמקה.`
              : "אין כרגע סרטונים מורשים מקושרים לנושא הזה. אפשר לתאם פגישת 1:1 להעמקה לפי מה שחיפשת או צפית."}
          </DialogDescription>
        </DialogHeader>

        {count > 0 ? (
          <ul className="mt-6 space-y-3">
            {props.videos.map((video) => {
              const thumb =
                video.thumbnail_url ?? "/brand/gated-lock.svg";
              return (
                <li key={video.id}>
                  <Link
                    href={getWatchHref(video)}
                    className="group flex gap-3 rounded-none border border-white/10 p-2 transition hover:border-white/30"
                    onClick={() => props.onOpenChange(false)}
                  >
                    <span className="relative aspect-video w-28 shrink-0 overflow-hidden bg-black sm:w-32">
                      <Image
                        src={thumb}
                        alt={video.title}
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    </span>
                    <span className="min-w-0 flex-1 text-start">
                      <span className="block line-clamp-2 text-sm font-semibold leading-snug tracking-tight group-hover:text-[#D42B2B]">
                        {video.title}
                      </span>
                      {video.sharedConcept ? (
                        <span className="mt-1 block text-xs text-[#9CA3AF]">
                          {video.sharedConcept}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}

        <a
          href={oneOnOneHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-none border border-white/40 px-4 text-sm font-semibold text-[#FAFAF8] transition hover:border-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D42B2B]"
          onClick={() => props.onOpenChange(false)}
        >
          {ACCESS_GATE_SECONDARY_CTA}
        </a>
      </DialogContent>
    </Dialog>
  );
}

export default DeepRabbitHole;
