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

import { BLIND_SPOT_TOOLTIP } from "@/lib/search/blind-spot-map";

/**
 * Client island: info tooltip only. Keeps VideoCard grids as RSC.
 */
export function BlindSpotInfoTip() {
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

  return (
    <>
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
    </>
  );
}
