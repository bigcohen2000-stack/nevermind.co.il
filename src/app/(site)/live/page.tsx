import type { Metadata } from "next";

import { LiveGateClient } from "@/components/live/live-gate-client";
import { Eyebrow } from "@/components/ui/editorial";
import { getLivePublicStatus } from "@/lib/live/status";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "שידור חי מהאין",
  description: "שידור חי לא רשום. הרשמה חינם ואישור גיל 18+ נדרשים.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: "https://nevermind.co.il/live",
  },
};

async function getLiveViewerState(): Promise<{
  signedIn: boolean;
  ageConfirmed: boolean;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { signedIn: false, ageConfirmed: false };
    }

    const admin = getSupabaseAdmin();
    const { data: profile } = await admin
      .from("profiles")
      .select("age_confirmed_at")
      .eq("id", user.id)
      .maybeSingle();

    return {
      signedIn: true,
      ageConfirmed: Boolean(profile?.age_confirmed_at),
    };
  } catch {
    return { signedIn: false, ageConfirmed: false };
  }
}

export default async function LivePage() {
  const [status, viewer] = await Promise.all([
    getLivePublicStatus(),
    getLiveViewerState(),
  ]);

  return (
    <main className="w-full text-start">
      <section
        aria-labelledby="live-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="text-center">
            <Eyebrow>שידור חי מהאין</Eyebrow>
            <h1
              id="live-title"
              className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              {status.isLive ? "השידור פעיל עכשיו." : "אין שידור כרגע."}
            </h1>
          </div>

          <div className="mt-10">
            <LiveGateClient
              isLive={status.isLive}
              topic={status.topic}
              signedIn={viewer.signedIn}
              ageConfirmed={viewer.ageConfirmed}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
