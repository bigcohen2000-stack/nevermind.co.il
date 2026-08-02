import { StudioSessionRequired } from "@/components/studio/studio-session-required";
import { StudioUsersDashboard } from "@/components/studio/studio-users-dashboard";
import { isStudioAuthenticated } from "@/lib/studio/session";
import { getStudioUsersDashboard } from "@/lib/studio/users-dashboard";

export const dynamic = "force-dynamic";

export default async function StudioUsersPage() {
  const unlocked = await isStudioAuthenticated();

  if (!unlocked) {
    return <StudioSessionRequired />;
  }

  const data = await getStudioUsersDashboard();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
      <StudioUsersDashboard data={data} />
    </main>
  );
}
