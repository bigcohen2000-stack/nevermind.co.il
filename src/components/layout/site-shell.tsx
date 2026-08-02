import type { ReactNode } from "react";

import { getHeaderSession } from "@/lib/auth/header-session";
import { DailyResetPrompt } from "@/components/push/daily-reset-prompt";
import { PresenceBeacon } from "@/components/layout/presence-beacon";
import { DotBackground } from "@/components/ui/dot-background";
import { FocusModeProvider } from "@/components/videos/focus-mode-context";
import { FocusModeChrome } from "./focus-mode-chrome";
import { MobileCtaBar } from "./mobile-cta-bar";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { SiteShellFrame } from "./site-shell-frame";

/**
 * SiteShell — page frame.
 *
 * Stacks header, the page content, and footer in a single column so the
 * footer sticks to the bottom on short pages. Content grows to fill the
 * available space. RTL is inherited from the root <html dir="rtl">.
 */

export async function SiteShell({ children }: { children: ReactNode }) {
  const session = await getHeaderSession();

  return (
    <FocusModeProvider>
      <SiteShellFrame>
        <FocusModeChrome>
          <DotBackground />
        </FocusModeChrome>
        <FocusModeChrome>
          <SiteHeader session={session} />
        </FocusModeChrome>
        <div className="relative z-0 flex flex-1 flex-col">{children}</div>
        <FocusModeChrome>
          <SiteFooter />
        </FocusModeChrome>
        <FocusModeChrome>
          <MobileCtaBar />
        </FocusModeChrome>
        <FocusModeChrome>
          <DailyResetPrompt />
        </FocusModeChrome>
        <PresenceBeacon session={session} />
      </SiteShellFrame>
    </FocusModeProvider>
  );
}

export default SiteShell;
