import { StudioGuidePanel } from "@/components/studio/studio-guide-panel";
import { StudioLockButton } from "@/components/studio/studio-lock-button";
import { StudioPageShell } from "@/components/studio/studio-page-shell";
import { StudioSessionRequired } from "@/components/studio/studio-session-required";
import { isStudioAuthenticated } from "@/lib/studio/session";

export const dynamic = "force-dynamic";

export default async function StudioGuidePage() {
  const unlocked = await isStudioAuthenticated();

  if (!unlocked) {
    return <StudioSessionRequired />;
  }

  return (
    <StudioPageShell
      active="guide"
      title="מדריך סטודיו"
      description="מה כל אזור עושה, מה אפשר לשנות, ואיפה. לשימוש פנימי בלבד."
      actions={<StudioLockButton />}
    >
      <StudioGuidePanel />
    </StudioPageShell>
  );
}
