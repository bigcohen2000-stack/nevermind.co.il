import type { Metadata } from "next";
import Link from "next/link";

import { listMemberQuestions } from "@/actions/viewer-feedback";
import { MyListSignInForm } from "@/components/auth/my-list-sign-in-form";
import { MemberQuestionsPanel } from "@/components/profile/member-questions-panel";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "שאלות על השיטה",
  description: "שאלות ממוקדות על יישום השיטה, עם מעקב תשובות.",
  robots: { index: false, follow: false },
};

export default async function ProfileQuestionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-full w-full bg-[#000000] text-[#FAFAF8]">
        <div className="mx-auto flex w-full max-w-lg flex-col px-6 py-16">
          <h1 className="text-3xl font-semibold tracking-tight">
            שאלות על השיטה
          </h1>
          <p className="mt-4 text-sm text-[#9CA3AF]">
            יש להתחבר כדי לשלוח שאלה ולעקוב אחרי תשובה.
          </p>
          <MyListSignInForm nextPath="/profile/questions" intent="login" />
        </div>
      </main>
    );
  }

  const items = await listMemberQuestions(40);

  return (
    <main className="min-h-full w-full bg-[#000000] text-[#FAFAF8]">
      <div className="mx-auto w-full max-w-3xl px-6 py-16 lg:py-24">
        <p className="text-xs tracking-[0.2em] text-[#9CA3AF]">פרופיל</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">
          שאלות על השיטה
        </h1>
        <p className="mt-4 max-w-prose text-sm text-[#9CA3AF]">
          ממשק סטרילי לשאלה אחת על יישום. בלי רעש של רשתות. תשובות מגיעות לכאן
          ולמייל.
        </p>
        <p className="mt-3 text-sm">
          <Link
            href="/profile"
            className="text-[#FAFAF8] underline-offset-2 hover:underline"
          >
            חזרה לפרופיל
          </Link>
        </p>
        <div className="mt-10">
          <MemberQuestionsPanel items={items} />
        </div>
      </div>
    </main>
  );
}
