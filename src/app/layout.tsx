import type { Metadata, Viewport } from "next";
import "./globals.css";
import { colors } from "@/lib/design-tokens";

const SITE_URL = "https://nevermind.co.il";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "השם לא משנה · NeverMinde: יקיר כהן",
    template: "%s | השם לא משנה",
  },
  description:
    "ניתוח לוגי של המציאות. הפרדה בין עובדה לבין סיפור, ללא דרמה ובלי מניפולציה.",
  applicationName: "השם לא משנה",
  authors: [{ name: "Yakir Cohen" }],
  appleWebApp: {
    capable: true,
    title: "השם לא משנה",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: SITE_URL,
    siteName: "השם לא משנה · NeverMinde",
    title: "השם לא משנה · NeverMinde",
    description:
      "ניתוח לוגי של המציאות. הפרדה בין עובדה לבין סיפור, ללא דרמה.",
  },
};

export const viewport: Viewport = {
  themeColor: colors.background,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased">
      <body className="flex min-h-full flex-col overflow-x-clip">{children}</body>
    </html>
  );
}
