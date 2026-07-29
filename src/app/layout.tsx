import type { Metadata } from "next";
import "./globals.css";
import { colors } from "@/lib/design-tokens";
import { SiteShell } from "@/components/layout/site-shell";

export const metadata: Metadata = {
  title: {
    default: "NeverMinde — יקיר כהן",
    template: "%s | NeverMinde",
  },
  description:
    "ניתוח לוגי של המציאות. הפרדה בין עובדה לבין סיפור, ללא דרמה ובלי מניפולציה.",
  applicationName: "NeverMinde",
  authors: [{ name: "Yakir Cohen" }],
};

export const viewport = {
  themeColor: colors.background,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
