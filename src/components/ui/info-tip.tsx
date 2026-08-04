"use client";

import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { Info } from "lucide-react";
import { useEffect, useId, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

type InfoTipProps = {
  label: string;
  children: string;
  /** dark = on ink/black surfaces. light = on paper/background. */
  tone?: "light" | "dark";
  className?: string;
};

const FINE_HOVER_MQ = "(hover: hover) and (pointer: fine)";

function subscribeFineHover(onStoreChange: () => void) {
  const mq = window.matchMedia(FINE_HOVER_MQ);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getFineHoverSnapshot() {
  return window.matchMedia(FINE_HOVER_MQ).matches;
}

/** Touch-first on SSR / unknown: click opens, no sticky hover. */
function getFineHoverServerSnapshot() {
  return false;
}

function useFineHover(): boolean {
  return useSyncExternalStore(
    subscribeFineHover,
    getFineHoverSnapshot,
    getFineHoverServerSnapshot,
  );
}

function useInputModality(): "pointer" | "keyboard" {
  const [modality, setModality] = useState<"pointer" | "keyboard">("pointer");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" || e.key === "Escape" || e.key.startsWith("Arrow")) {
        setModality("keyboard");
      }
    };
    const onPointer = () => setModality("pointer");
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("pointerdown", onPointer, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("pointerdown", onPointer, true);
    };
  }, []);

  return modality;
}

/**
 * Accessible tip: hover on fine pointers, click/tap on touch.
 * Portal + flip/shift/size keep the bubble in the viewport.
 * Esc dismisses. Keyboard users see a small Esc hint.
 */
export function InfoTip({
  label,
  children,
  tone = "light",
  className,
}: InfoTipProps) {
  const tipId = useId();
  const [open, setOpen] = useState(false);
  const fineHover = useFineHover();
  const modality = useInputModality();

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "top",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ padding: 12 }),
      shift({ padding: 12 }),
      size({
        padding: 12,
        apply({ availableWidth, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxWidth: `${Math.min(20 * 16, Math.max(0, availableWidth))}px`,
            maxHeight: `${Math.max(0, availableHeight)}px`,
          });
        },
      }),
    ],
  });

  const hover = useHover(context, {
    enabled: fineHover,
    mouseOnly: true,
    move: false,
    delay: { open: 80, close: 60 },
  });
  const click = useClick(context, {
    enabled: !fineHover,
    toggle: true,
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context, {
    escapeKey: true,
    outsidePress: true,
  });
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    click,
    focus,
    dismiss,
    role,
  ]);

  const showEscHint = open && modality === "keyboard";

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
        aria-expanded={open}
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
            className="z-[120] overflow-auto border border-foreground/20 bg-[#0A0A0B] px-3 py-2 text-start text-sm leading-relaxed text-[#FAFAF8]"
            {...getFloatingProps()}
          >
            <p>{children}</p>
            {showEscHint ? (
              <p className="mt-2 text-[10px] tracking-wide text-[#9CA3AF]">
                [Esc]
              </p>
            ) : null}
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}
