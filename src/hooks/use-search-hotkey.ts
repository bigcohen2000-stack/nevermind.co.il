"use client";

import { useEffect } from "react";

/**
 * Focus / open global search on Ctrl/Cmd+K or `/`.
 * Ignores when focus is already in an editable field (INPUT / TEXTAREA / contentEditable).
 */

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest("[contenteditable='true']"));
}

function isEditableActive(): boolean {
  if (typeof document === "undefined") return false;
  return isEditableTarget(document.activeElement);
}

type UseSearchHotkeyOptions = {
  /** Open the global command palette (preferred). */
  onOpen?: () => void;
};

/**
 * ⌘/Ctrl+K and `/` open the command palette when provided.
 */
export function useSearchHotkey(options: UseSearchHotkeyOptions = {}) {
  const { onOpen } = options;

  useEffect(() => {
    if (!onOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const isModK =
        (event.key === "k" || event.key === "K") &&
        (event.metaKey || event.ctrlKey);
      const isSlash =
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey;

      if (!isModK && !isSlash) return;
      if (isEditableTarget(event.target) || isEditableActive()) return;

      event.preventDefault();
      onOpen();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpen]);
}
