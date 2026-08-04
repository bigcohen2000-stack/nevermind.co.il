import Link from "next/link";

/**
 * Invalid / expired meeting confirmation token.
 * Keeps a clear Hebrew message instead of the generic site 404.
 */
export default function MeetingLinkNotFound() {
  return (
    <main
      className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col justify-center px-4 py-16"
      dir="rtl"
    >
      <p className="text-xs tracking-wide text-muted">NeverMinde</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        אישור פגישה
      </h1>
      <p className="mt-6 text-sm text-red-600" role="alert">
        הקישור לא נמצא או שפג תוקפו.
      </p>
      <p className="mt-10 text-xs text-muted">
        <Link href="/" className="underline-offset-2 hover:underline">
          חזרה לאתר
        </Link>
      </p>
    </main>
  );
}
