import { StudioGuidePanel } from "@/components/studio/studio-guide-panel";
import { StudioLockButton } from "@/components/studio/studio-lock-button";
import { StudioNav } from "@/components/studio/studio-nav";
import { StudioSessionRequired } from "@/components/studio/studio-session-required";
import { isStudioAuthenticated } from "@/lib/studio/session";

export const dynamic = "force-dynamic";

export default async function StudioGuidePage() {
  const unlocked = await isStudioAuthenticated();

  if (!unlocked) {
    return <StudioSessionRequired />;
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12 sm:py-16" dir="rtl">
      <header className="space-y-5">
        <StudioNav active="guide" actions={<StudioLockButton />} />
        <div>
          <p className="text-xs text-zinc-500">ניהול פנימי</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
            מדריך סטודיו
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
            מה כל אזור עושה, מה אפשר לשנות, ואיפה. לשימוש פנימי בלבד.
          </p>
        </div>
      </header>

      <div className="mt-10">
        <StudioGuidePanel />
      </div>
    </main>
  );
}
