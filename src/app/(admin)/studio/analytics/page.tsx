import { StudioUnlockForm } from "@/components/studio/studio-unlock-form";
import { SearchAnalyticsDashboard } from "@/components/studio/search-analytics-dashboard";
import { getSearchAnalyticsDashboard } from "@/lib/studio/search-analytics-dashboard";
import { isStudioAuthenticated } from "@/lib/studio/session";

export const dynamic = "force-dynamic";

export default async function StudioAnalyticsPage() {
  const unlocked = await isStudioAuthenticated();

  if (!unlocked) {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-6 py-16">
        <StudioUnlockForm />
      </main>
    );
  }

  const data = await getSearchAnalyticsDashboard();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
      <SearchAnalyticsDashboard data={data} />
    </main>
  );
}
