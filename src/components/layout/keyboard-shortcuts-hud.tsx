/**
 * Discrete fixed hint of active keyboard shortcuts.
 * Decorative only: no focus, no pointer events.
 */
export function KeyboardShortcutsHud() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 z-[45] hidden justify-center px-3 min-[400px]:flex bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-3"
    >
      <div className="flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-md border border-foreground/15 bg-black/70 px-3 py-1.5 text-[11px] leading-none text-foreground/70 backdrop-blur-sm sm:text-xs">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <Kbd>⌘K</Kbd>
          <span className="text-muted">/</span>
          <Kbd>/</Kbd>
          <span className="text-muted">חיפוש</span>
        </span>
        <span className="text-foreground/30" aria-hidden="true">
          |
        </span>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <Kbd>Esc</Kbd>
          <span className="text-muted">סגירה</span>
        </span>
        <span className="text-foreground/30" aria-hidden="true">
          |
        </span>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <Kbd>↑/↓</Kbd>
          <span className="text-muted">ניווט</span>
        </span>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="rounded border border-foreground/20 bg-foreground/5 px-1.5 py-0.5 font-sans text-[10px] font-medium tracking-wide text-foreground/80 sm:text-[11px]">
      {children}
    </kbd>
  );
}
