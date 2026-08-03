import Link from "next/link";

import { StudioBannersPanel } from "@/components/studio/studio-banners-panel";
import { StudioPageShell } from "@/components/studio/studio-page-shell";
import { StudioSessionRequired } from "@/components/studio/studio-session-required";
import { listStudioBanners } from "@/lib/studio/banners";
import { isStudioAuthenticated } from "@/lib/studio/session";

export const dynamic = "force-dynamic";

export default async function StudioBannersPage() {
  const unlocked = await isStudioAuthenticated();

  if (!unlocked) {
    return <StudioSessionRequired />;
  }

  const banners = await listStudioBanners();

  return (
    <StudioPageShell
      active="banners"
      title="באנרים"
      description="תבניות מוכנות, הצעות כתיבה, וטיוטות כבויות. באנר פעיל אחד לכל מיקום."
      actions={
        <Link
          href="/studio"
          className="border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
        >
          חזרה לסטודיו
        </Link>
      }
    >
      <StudioBannersPanel initialBanners={banners} />
    </StudioPageShell>
  );
}
