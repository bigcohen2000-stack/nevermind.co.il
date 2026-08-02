import { StudioSessionRequired } from "@/components/studio/studio-session-required";
import { SearchAnalyticsDashboard } from "@/components/studio/search-analytics-dashboard";
import { getSearchAnalyticsDashboard } from "@/lib/studio/search-analytics-dashboard";
import { isStudioAuthenticated } from "@/lib/studio/session";

export const dynamic = "force-dynamic";

export default async function StudioAnalyticsPage() {
  const unlocked = await isStudioAuthenticated();

  if (!unlocked) {
    return <StudioSessionRequired />;
  }

  const data = await getSearchAnalyticsDashboard();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
      <SearchAnalyticsDashboard data={data} />
    </main>
  );
}
