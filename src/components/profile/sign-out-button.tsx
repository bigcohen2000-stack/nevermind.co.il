"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onSignOut() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.refresh();
      router.push("/");
    });
  }

  return (
    <button
      type="button"
      onClick={onSignOut}
      disabled={pending}
      className="border border-[#FAFAF8]/25 px-4 py-2 text-sm text-[#9CA3AF] transition hover:border-[#FAFAF8]/50 hover:text-[#FAFAF8] disabled:opacity-50"
    >
      {pending ? "יוצא..." : "התנתק"}
    </button>
  );
}
