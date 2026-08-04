import type { ReactNode } from "react";

import { AccessibilityToolbar } from "@/components/a11y/accessibility-toolbar";
import { WhatsAppFloat } from "@/components/contact/whatsapp-float";
import { AccessTierMarker } from "@/components/layout/access-tier-marker";
import { ClubMemberChrome } from "@/components/layout/club-member-chrome";
import { getHeaderSession } from "@/lib/auth/header-session";
import { resolveSiteAccessTier } from "@/lib/access/site-tier";
import { resolveVideoEntitlement } from "@/lib/club/access";
import { getLiveUpdateItems } from "@/lib/site/live-updates";
import { resolveSiteTheme } from "@/lib/theme/preference";
import { DailyResetPrompt } from "@/components/push/daily-reset-prompt";
import { PresenceBeacon } from "@/components/layout/presence-beacon";
import { DotBackground } from "@/components/ui/dot-background";
import { FocusModeProvider } from "@/components/videos/focus-mode-context";
import { CommandPaletteRoot } from "@/components/search/command-palette-root";
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
  const [session, liveUpdates, access] = await Promise.all([
    getHeaderSession(),
    getLiveUpdateItems().catch(() => []),
    resolveVideoEntitlement().catch(() => ({
      entitled: false,
      clubSession: false,
      hasVideoAccess: false,
      isAuthenticated: false,
      phone: null as string | null,
      displayName: null as string | null,
    })),
  ]);
  const theme = await resolveSiteTheme(session);
  const accessTier = resolveSiteAccessTier({
    authUserId: session.authUserId,
    entitled: access.entitled || access.hasVideoAccess,
  });
  const isClub = accessTier === "club";
  const sessionForUi = {
    ...session,
    displayName: access.displayName || session.displayName,
  };

  return (
    <CommandPaletteRoot>
      <FocusModeProvider>
        <SiteShellFrame>
          <AccessTierMarker tier={accessTier} />
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
              <LiveUpdatesBar items={liveUpdates} />
            </FocusModeChrome>
            <FocusModeChrome>
              <SiteStatusBanner session={sessionForUi} accessTier={accessTier} />
            </FocusModeChrome>
            <FocusModeChrome>
              <SiteHeader
                session={sessionForUi}
                theme={theme}
                accessTier={accessTier}
              />
            </FocusModeChrome>
            {isClub ? (
              <FocusModeChrome>
                <ClubMemberChrome variant="strip" />
              </FocusModeChrome>
            ) : null}
          </div>
          <div
            id="main-content"
            tabIndex={-1}
            className="relative z-0 flex flex-1 flex-col outline-none"
          >
            {children}
          </div>
          <FocusModeChrome>
            <SiteFooter />
          </FocusModeChrome>
          {!isClub ? (
            <FocusModeChrome>
              <SiteBetaBanner />
            </FocusModeChrome>
          ) : null}
          <FocusModeChrome>
            <MobileCtaBar />
          </FocusModeChrome>
          <FocusModeChrome>
            <KeyboardShortcutsHud />
          </FocusModeChrome>
          <FocusModeChrome>
            <DailyResetPrompt />
          </FocusModeChrome>
          <PresenceBeacon session={sessionForUi} />
          <FocusModeChrome>
            <AccessibilityToolbar />
          </FocusModeChrome>
          <FocusModeChrome>
            <WhatsAppFloat />
          </FocusModeChrome>
        </SiteShellFrame>
      </FocusModeProvider>
    </CommandPaletteRoot>
  );
}

export default SiteShell;
