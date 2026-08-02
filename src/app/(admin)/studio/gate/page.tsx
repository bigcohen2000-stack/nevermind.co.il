import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StudioUnlockForm } from "@/components/studio/studio-unlock-form";
import { isStudioAuthenticated } from "@/lib/studio/session";
import { getStudioGateSlug } from "@/lib/studio/token";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ops",
  robots: { index: false, follow: false },
};

/**
 * Internal unlock UI. Public URL is /{STUDIO_GATE_SLUG} (default /nm-ops).
 * Direct /studio/gate is blocked by middleware.
 */
export default async function StudioGatePage() {
  const unlocked = await isStudioAuthenticated();
  if (unlocked) {
    redirect("/studio");
  }

  const slug = getStudioGateSlug();

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-6 py-16">
      <StudioUnlockForm gatePath={`/${slug}`} />
    </main>
  );
}
