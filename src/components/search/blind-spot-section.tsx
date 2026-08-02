"use client";

import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useFloating,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { Info } from "lucide-react";
import { useId, useState } from "react";

import { VideoCard } from "@/components/videos/video-card";
import { BLIND_SPOT_TOOLTIP } from "@/lib/search/blind-spot-map";
import type { Video } from "@/types/supabase";

type BlindSpotSectionProps = {
  premise: string;
  opposite: string;
  tease: string;
  videos: Video[];
  savedIds?: Set<string>;
};

/**
 * Contrasting "blind spot" block above search results:
 * videos for the mapped opposite of the user's search premise.
 */
export function BlindSpotSection({
  premise,
  opposite,
  tease,
  videos,
  savedIds,
}: BlindSpotSectionProps) {
  const tipId = useId();
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "top",
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
  });

  const hover = useHover(context, {
    move: false,
    delay: { open: 120, close: 0 },
  });
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    role,
  ]);

  if (videos.length === 0) return null;

  return (
    <section
      aria-labelledby="blind-spot-title"
      className="border border-action bg-ink px-5 py-6 text-[#FAFAF8] sm:px-7 sm:py-8"
    >
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-wide text-action">
            כיוון הפוך
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2
              id="blind-spot-title"
              className="text-xl font-semibold tracking-tight sm:text-2xl"
            >
              השטח העיוור שלך
            </h2>
            <button
              type="button"
              ref={refs.setReference}
              className="inline-flex size-8 items-center justify-center text-[#9CA3AF] transition hover:text-[#FAFAF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
              aria-label="הסבר על השטח העיוור"
              aria-describedby={open ? tipId : undefined}
              {...getReferenceProps()}
            >
              <Info className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#9CA3AF]">
            חיפשת{" "}
            <span className="text-[#FAFAF8]">{premise}</span>
            . הכיוון ההפוך:{" "}
            <span className="text-action">{opposite}</span>
            . {tease}
          </p>
        </div>
      </div>

      {open ? (
        <FloatingPortal>
          <div
            id={tipId}
            ref={refs.setFloating}
            style={floatingStyles}
            className="z-50 max-w-xs border border-white/20 bg-black px-3 py-2 text-sm leading-relaxed text-[#FAFAF8] shadow-soft"
            {...getFloatingProps()}
          >
            {BLIND_SPOT_TOOLTIP}
          </div>
        </FloatingPortal>
      ) : null}

      <ul className="mt-6 grid gap-6 sm:grid-cols-2">
        {videos.map((video) => (
          <li key={video.id}>
            <VideoCard
              video={video}
              initialSaved={savedIds?.has(video.youtube_id) ?? false}
              tone="dark"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
