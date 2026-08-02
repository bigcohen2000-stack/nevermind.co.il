import { redeemClubToken } from "@/actions/club-login";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ClubLoginPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token?.trim()) {
    return (
      <main className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col justify-center px-6 py-16 text-start">
        <h1 className="text-2xl font-semibold tracking-tight">כניסה למועדון</h1>
        <p className="mt-4 text-sm leading-relaxed text-foreground/80">
          חסר קישור תקף. בקשו קישור חדש בוואטסאפ, או היכנסו עם סיסמה.
        </p>
        <p className="mt-6">
          <Link href="/members#login" className="btn btn-primary">
            לעמוד הכניסה
          </Link>
        </p>
      </main>
    );
  }

  const result = await redeemClubToken(token);
  if (result.ok) {
    redirect("/videos");
  }

  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col justify-center px-6 py-16 text-start">
      <h1 className="text-2xl font-semibold tracking-tight">כניסה למועדון</h1>
      <p className="mt-4 text-sm leading-relaxed text-foreground/80">
        {result.error}
      </p>
      <p className="mt-6 flex flex-wrap gap-3">
        <Link href="/members#login" className="btn btn-primary">
          כניסה עם סיסמה
        </Link>
        <Link href="/contact" className="btn btn-secondary">
          צור קשר
        </Link>
      </p>
    </main>
  );
}
