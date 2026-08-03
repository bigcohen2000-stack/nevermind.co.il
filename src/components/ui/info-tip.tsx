"use client";

import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { Info } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/utils";

type InfoTipProps = {
  label: string;
  children: string;
  /** dark = on ink/black surfaces. light = on paper/background. */
  tone?: "light" | "dark";
  className?: string;
};

/**
 * Accessible hover/focus tooltip for short explanations.
 */
export function InfoTip({
  label,
  children,
  tone = "light",
  className,
}: InfoTipProps) {
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
    delay: { open: 80, close: 60 },
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  return (
    <>
      <button
        type="button"
        ref={refs.setReference}
        className={cn(
          "inline-flex size-7 shrink-0 items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
          tone === "dark"
            ? "text-[#9CA3AF] hover:text-[#FAFAF8]"
            : "text-muted hover:text-foreground",
          className,
        )}
        aria-label={label}
        aria-describedby={open ? tipId : undefined}
        {...getReferenceProps()}
      >
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      {open ? (
        <FloatingPortal>
          <div
            id={tipId}
            ref={refs.setFloating}
            style={floatingStyles}
            className="z-[120] max-w-xs border border-foreground/20 bg-[#0A0A0B] px-3 py-2 text-start text-sm leading-relaxed text-[#FAFAF8]"
            {...getFloatingProps()}
          >
            {children}
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}
