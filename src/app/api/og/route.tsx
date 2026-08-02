import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { colors, onDark, supportingColors } from "@/lib/design-tokens";
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
} from "@/lib/og/share-image";

export const runtime = "nodejs";

const MAX_TITLE_LENGTH = 80;
const DEFAULT_TITLE = "השם לא משנה";
const FONT_NAME = "NotoSansHebrew";

function sanitizeTitle(raw: string | null): string {
  const cleaned = (raw ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return DEFAULT_TITLE;
  if (cleaned.length <= MAX_TITLE_LENGTH) return cleaned;
  return `${cleaned.slice(0, MAX_TITLE_LENGTH - 3).trimEnd()}...`;
}

/**
 * Satori paints Hebrew in logical order left-to-right unless we force a visual
 * RTL override. Reverse graphemes so the card reads correctly right-to-left.
 */
function visualRtl(text: string): string {
  return [...text].reverse().join("");
}

async function loadAssets() {
  const [fontData, logoData] = await Promise.all([
    readFile(
      join(process.cwd(), "src/assets/fonts/NotoSansHebrew-Bold.ttf"),
    ),
    readFile(join(process.cwd(), "public/brand/logo-on-dark.png")),
  ]);

  return {
    fontData,
    logoSrc: `data:image/png;base64,${logoData.toString("base64")}`,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = sanitizeTitle(searchParams.get("title"));
  const displayTitle = visualRtl(title);
  const { fontData, logoSrc } = await loadAssets();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-end",
          backgroundColor: supportingColors.ink,
          color: onDark.foreground,
          padding: "56px 64px",
          fontFamily: FONT_NAME,
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <img
            src={logoSrc}
            alt=""
            width={220}
            height={72}
            style={{
              width: 220,
              height: 72,
              objectFit: "contain",
              objectPosition: "right center",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 28,
            width: "100%",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 96,
              height: 4,
              backgroundColor: colors.action,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: title.length > 40 ? 52 : 64,
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
              color: onDark.foreground,
              textAlign: "right",
              maxWidth: 1040,
              justifyContent: "flex-end",
            }}
          >
            {displayTitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              color: colors.action,
            }}
          >
            NeverMinde
          </div>
        </div>
      </div>
    ),
    {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      fonts: [
        {
          name: FONT_NAME,
          data: fontData,
          weight: 700,
          style: "normal",
        },
      ],
      headers: {
        "Cache-Control":
          "public, immutable, no-transform, max-age=31536000",
      },
    },
  );
}
