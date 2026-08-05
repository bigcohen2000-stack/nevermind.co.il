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
import Link from "next/link";
import { useCallback, useId, useState } from "react";

import { cn } from "@/lib/utils";

type ConceptTermProps = {
  term: string;
  definition: string;
  className?: string;
};

/**
 * Underlined glossary term with hover/focus definition tooltip.
 */
export function ConceptTerm({ term, definition, className }: ConceptTermProps) {
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
    delay: { open: 100, close: 80 },
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
  const setReferenceRef = useCallback(
    (node: HTMLAnchorElement | null) => {
      refs.setReference(node);
    },
    [refs],
  );
  const setFloatingRef = useCallback(
    (node: HTMLDivElement | null) => {
      refs.setFloating(node);
    },
    [refs],
  );

  return (
    <>
      <Link
        href={`/search?q=${encodeURIComponent(term)}`}
        ref={setReferenceRef}
        className={cn(
          "underline decoration-foreground/35 decoration-dotted underline-offset-[3px]",
          "text-inherit hover:decoration-action hover:text-action",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
          className,
        )}
        aria-describedby={open ? tipId : undefined}
        data-ai-hint="term"
        data-term={term}
        {...getReferenceProps()}
      >
        {term}
      </Link>
      {open ? (
        <FloatingPortal>
          <div
            id={tipId}
            ref={setFloatingRef}
            style={floatingStyles}
            className="z-[120] max-w-xs border border-foreground/20 bg-[#0A0A0B] px-3 py-2 text-start text-sm leading-relaxed text-[#FAFAF8]"
            {...getFloatingProps()}
          >
            <p className="text-xs font-medium text-[#D42B2B]">{term}</p>
            <p className="mt-1">{definition}</p>
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}
