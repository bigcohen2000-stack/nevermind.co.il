import type { ReactNode } from "react";

import { AccessibilityToolbar } from "@/components/a11y/accessibility-toolbar";
import { WhatsAppFloat } from "@/components/contact/whatsapp-float";
import { getHeaderSession } from "@/lib/auth/header-session";
import { getLiveUpdateItems } from "@/lib/site/live-updates";
import { resolveSiteTheme } from "@/lib/theme/preference";
import { DailyResetPrompt } from "@/components/push/daily-reset-prompt";
import { PresenceBeacon } from "@/components/layout/presence-beacon";
import { DotBackground } from "@/components/ui/dot-background";
import { FocusModeProvider } from "@/components/videos/focus-mode-context";
import { FocusModeChrome } from "./focus-mode-chrome";
import { KeyboardShortcutsHud } from "./keyboard-shortcuts-hud";
import { LiveUpdatesBar } from "./live-updates-bar";
import { MobileCtaBar } from "./mobile-cta-bar";
import { OfflineStatusBar } from "./offline-status-bar";
import { SiteBetaBanner } from "./site-beta-banner";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { SiteShellFrame } from "./site-shell-frame";
import { SiteStatusBanner } from "./site-status-banner";

/**
 * SiteShell — page frame.
 *
 * Stacks header, the page content, and footer in a single column so the
 * footer sticks to the bottom on short pages. Content grows to fill the
 * available space. RTL is inherited from the root <html dir="rtl">.
 */

export async function SiteShell({ children }: { children: ReactNode }) {
  const [session, liveUpdates] = await Promise.all([
    getHeaderSession(),
    getLiveUpdateItems().catch(() => []),
  ]);
  const theme = await resolveSiteTheme(session);

  return (
    <FocusModeProvider>
      <SiteShellFrame>
        <a
          href="#main-content"
          className="absolute start-4 top-0 z-[100] -translate-y-[120%] border border-transparent bg-action px-4 py-2 text-sm font-semibold text-white transition focus:translate-y-4 focus:outline-none focus:ring-2 focus:ring-white"
        >
          דילוג לתוכן הראשי
        </a>
        <FocusModeChrome>
          <DotBackground />
        </FocusModeChrome>
        <div className="sticky top-0 z-50">
          <OfflineStatusBar />
          <FocusModeChrome>
            <SiteBetaBanner />
          </FocusModeChrome>
          <FocusModeChrome>
            <SiteStatusBanner session={session} />
          </FocusModeChrome>
          <FocusModeChrome>
            <SiteHeader session={session} theme={theme} />
          </FocusModeChrome>
        </div>
        <div
          id="main-content"
          tabIndex={-1}
          className="relative z-0 flex flex-1 flex-col outline-none"
        >
          {children}
        </div>
        <FocusModeChrome>
          <LiveUpdatesBar items={liveUpdates} />
        </FocusModeChrome>
        <FocusModeChrome>
          <SiteFooter />
        </FocusModeChrome>
        <FocusModeChrome>
          <MobileCtaBar />
        </FocusModeChrome>
        <FocusModeChrome>
          <KeyboardShortcutsHud />
        </FocusModeChrome>
        <FocusModeChrome>
          <DailyResetPrompt />
        </FocusModeChrome>
        <PresenceBeacon session={session} />
        <AccessibilityToolbar />
        <FocusModeChrome>
          <WhatsAppFloat />
        </FocusModeChrome>
      </SiteShellFrame>
    </FocusModeProvider>
  );
}

export default SiteShell;
