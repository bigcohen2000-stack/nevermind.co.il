import type { ReactNode } from "react";

import {
  StudioNav,
  type StudioNavActive,
} from "@/components/studio/studio-nav";

type StudioPageShellProps = {
  active: StudioNavActive;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  /** Optional summary strip under the title (counts, alerts). */
  summary?: ReactNode;
};

/**
 * Shared Studio page chrome: nav + title + content.
 */
export function StudioPageShell({
  active,
  title,
  description,
  actions,
  children,
  summary,
}: StudioPageShellProps) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="space-y-6 border-b border-zinc-800 pb-8">
        <StudioNav active={active} actions={actions} />
        <div>
          <p className="text-xs font-medium tracking-wide text-zinc-500">
            ניהול פנימי
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              {description}
            </p>
          ) : null}
        </div>
        {summary}
      </header>
      <div className="pt-10">{children}</div>
    </main>
  );
}
