import { StudioLockButton } from "@/components/studio/studio-lock-button";
import { StudioNewsletterPanel } from "@/components/studio/studio-newsletter-panel";
import { StudioPageShell } from "@/components/studio/studio-page-shell";
import { StudioSessionRequired } from "@/components/studio/studio-session-required";
import { getNewsletterDashboard } from "@/lib/studio/newsletter-subscribers";
import { isStudioAuthenticated } from "@/lib/studio/session";

export const dynamic = "force-dynamic";

export default async function StudioNewsletterPage() {
  const unlocked = await isStudioAuthenticated();

  if (!unlocked) {
    return <StudioSessionRequired />;
  }

  const data = await getNewsletterDashboard();

  return (
    <StudioPageShell
      active="newsletter"
      title="עדכון במייל"
      description="רשימת מנויים לעדכון במייל. אין שליחה אוטומטית עדיין. ייצוא CSV לשליחה ידנית דרך Resend."
      actions={<StudioLockButton />}
      summary={
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          <span>
            פעילים:{" "}
            <strong className="text-zinc-100">{data.activeCount}</strong>
          </span>
          <span>
            בוטלו:{" "}
            <strong className="text-zinc-100">{data.unsubscribedCount}</strong>
          </span>
          <span>
            סה&quot;כ:{" "}
            <strong className="text-zinc-100">{data.rows.length}</strong>
          </span>
        </div>
      }
    >
      <StudioNewsletterPanel data={data} />
    </StudioPageShell>
  );
}
