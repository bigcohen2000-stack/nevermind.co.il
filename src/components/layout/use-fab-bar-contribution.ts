"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

import {
  clearFabBarContribution,
  setFabBarContribution,
  type FabBarSource,
} from "@/lib/layout/fab-offset";

/**
 * Measures a bottom bar and publishes its height into --nm-fab-bar
 * while `active` is true. Clears on deactivate / unmount.
 */
export function useFabBarContribution<T extends HTMLElement>(
  source: FabBarSource,
  active: boolean,
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useLayoutEffect(() => {
    if (!active) {
      clearFabBarContribution(source);
      return;
    }

    const el = ref.current;
    if (!el) {
      clearFabBarContribution(source);
      return;
    }

    const publish = () => {
      setFabBarContribution(source, el.getBoundingClientRect().height);
    };
    publish();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(publish)
        : null;
    ro?.observe(el);

    return () => {
      ro?.disconnect();
      clearFabBarContribution(source);
    };
  }, [source, active]);

  return ref;
}
