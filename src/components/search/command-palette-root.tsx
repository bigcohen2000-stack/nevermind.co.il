"use client";

import type { ReactNode } from "react";

import { CommandPalette } from "@/components/search/command-palette";
import { CommandPaletteProvider } from "@/components/search/command-palette-context";

/**
 * Client root for global ⌘K palette. Wrap site chrome children once.
 */
export function CommandPaletteRoot({ children }: { children: ReactNode }) {
  return (
    <CommandPaletteProvider>
      {children}
      <CommandPalette />
    </CommandPaletteProvider>
  );
}
