import Link from "next/link";

import { StudioFeaturedCommentsPanel } from "@/components/studio/studio-featured-comments-panel";
import { StudioPageShell } from "@/components/studio/studio-page-shell";
import { StudioSessionRequired } from "@/components/studio/studio-session-required";
import { listStudioFeaturedComments } from "@/lib/studio/featured-comments";
import { isStudioAuthenticated } from "@/lib/studio/session";

export const dynamic = "force-dynamic";

export default async function StudioFeaturedCommentsPage() {
  const unlocked = await isStudioAuthenticated();

  if (!unlocked) {
    return <StudioSessionRequired />;
  }

  const rows = await listStudioFeaturedComments();

  return (
    <StudioPageShell
      active="comments"
      title="תגובות מאומתות"
      description='ניהול "החוקר המצטיין" בעמודי הצפייה. הוספה ומחיקה בלי CSV.'
      actions={
        <Link
          href="/studio"
          className="border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
        >
          חזרה לסטודיו
        </Link>
      }
    >
      <StudioFeaturedCommentsPanel initialRows={rows} />
    </StudioPageShell>
  );
}
