import type { Metadata } from "next";

import { ThoughtDeconstructor } from "@/components/booking/thought-deconstructor";
import { Eyebrow, Watermark } from "@/components/ui/editorial";
import { shareImageMetadata } from "@/lib/og/share-image";

export const metadata: Metadata = {
  title: "מפרק מחשבות",
  description:
    "פרק מחשבה לעובדות ולסיפור, ואז קבע שיחת עומק. הכנה לוגית לפני הפגישה.",
  alternates: {
    canonical: "https://nevermind.co.il/booking",
  },
  ...shareImageMetadata("מפרק מחשבות."),
};

type PageProps = {
  searchParams: Promise<{ from?: string }>;
};

export default async function BookingPage({ searchParams }: PageProps) {
  const { from } = await searchParams;
  const source = from?.trim() || "thought-deconstructor";

  return (
    <main className="w-full text-start">
      <section aria-labelledby="booking-hero-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-foreground/[0.045] sm:text-[9rem] lg:text-[12rem]">
          פירוק
        </Watermark>
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
          <Eyebrow onDark>לפני הפגישה</Eyebrow>
          <h1
            id="booking-hero-title"
            className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            מפרק מחשבות.
            <br />
            עובדה מול סיפור.
          </h1>
          <p className="mt-7 max-w-prose text-lg leading-relaxed text-foreground/80">
            שני שלבים: כותבים את המחשבה, מפרידים לדליים, ורק אז קובעים שיחה. כך
            המאמן רואה את הפירוק מראש.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="deconstructor-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto w-full max-w-4xl px-6 py-16 lg:py-24">
          <Eyebrow>תרגיל</Eyebrow>
          <h2
            id="deconstructor-title"
            className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
          >
            מפרק המחשבות
          </h2>
          <p className="mt-4 max-w-prose leading-relaxed text-foreground/80">
            אין כאן מוטיבציה. רק מבנה: מחשבה, עובדות, פרשנות, ואז יצירת קשר.
          </p>
          <div className="mt-10">
            <ThoughtDeconstructor source={source} />
          </div>
        </div>
      </section>
    </main>
  );
}
