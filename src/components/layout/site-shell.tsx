import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

/**
 * SiteShell — page frame.
 *
 * Stacks header, the page content, and footer in a single column so the
 * footer sticks to the bottom on short pages. Content grows to fill the
 * available space. RTL is inherited from the root <html dir="rtl">.
 */

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  );
}

export default SiteShell;
