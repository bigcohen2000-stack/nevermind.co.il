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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useId, useRef, useState } from "react";

type ExploreItem = {
  href: string;
  label: string;
  tip: string;
};

const ITEMS: ExploreItem[] = [
  { href: "/articles", label: "מאמרים", tip: "מסגרת כתובה לפי נושא" },
  { href: "/videos", label: "סרטונים", tip: "אותו ניתוח בקול" },
  { href: "/concepts", label: "מושגים", tip: "מדריך מושגים לפי סרטונים" },
  { href: "/paths", label: "מסלולים", tip: "איך ממשיכים בפועל" },
  { href: "/mechanisms", label: "מנגנונים", tip: "מפת מושגים ותבניות" },
];

function ExploreLink({ item }: { item: ExploreItem }) {
  const router = useRouter();
  const tipId = useId();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    delay: { open: 200, close: 0 },
  });
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    role,
  ]);

  const setFloatingRef = useCallback(
    (node: HTMLDivElement | null) => {
      refs.setFloating(node);
    },
    [refs],
  );

  const setReferenceRef = useCallback(
    (node: HTMLAnchorElement | null) => {
      refs.setReference(node);
    },
    [refs],
  );

  const clearPrefetchTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <>
      <Link
        ref={setReferenceRef}
        href={item.href}
        prefetch={false}
        aria-describedby={open ? tipId : undefined}
        className="inline-flex min-h-11 items-center px-1 text-sm text-white/80 no-underline transition-colors hover:text-white hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        onMouseEnter={() => {
          clearPrefetchTimer();
          timerRef.current = setTimeout(() => {
            router.prefetch(item.href);
          }, 50);
        }}
        onMouseLeave={clearPrefetchTimer}
        {...getReferenceProps()}
      >
        {item.label}
      </Link>
      {open ? (
        <FloatingPortal>
          <div
            id={tipId}
            ref={setFloatingRef}
            style={floatingStyles}
            className="z-50 max-w-[14rem] rounded-md border border-white/20 bg-black/90 px-2.5 py-1.5 text-xs text-white/90 shadow-soft backdrop-blur-sm"
            {...getFloatingProps()}
          >
            {item.tip}
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}

/** Quiet secondary exploration links with hover prefetch and collision-aware tips. */
export function ExploreLinks() {
  return (
    <nav
      aria-label="חקירה לפי אזור"
      className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm sm:gap-x-3"
    >
      {ITEMS.map((item, index) => (
        <span key={item.href} className="inline-flex items-center gap-x-2 sm:gap-x-3">
          {index > 0 ? (
            <span aria-hidden="true" className="text-white/35">
              ·
            </span>
          ) : null}
          <ExploreLink item={item} />
        </span>
      ))}
    </nav>
  );
}
