import type { MetadataRoute } from "next";

import { colors } from "@/lib/design-tokens";

/**
 * Web app manifest for השם לא משנה / NeverMinde.
 * Enables Add to Home Screen + beforeinstallprompt when icons and SW are present.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "השם לא משנה · NeverMinde",
    short_name: "השם לא משנה",
    description:
      "ניתוח לוגי של המציאות. הפרדה בין עובדה לבין סיפור, ללא דרמה.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: colors.background,
    theme_color: colors.background,
    lang: "he",
    dir: "rtl",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
