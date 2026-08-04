import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "طاها حسینی — جایی که اندیشه، کالبد می‌یابد";

/**
 * Satori (next/og) cannot shape Persian: the default font's OpenType
 * substitution table throws `lookupType: 5 - substFormat: 3 is not yet
 * supported`, and Arabic-script text needs contextual glyph joining that
 * Satori doesn't do. So the card is built from Vazirmatn, fetched as a
 * real font buffer, which ships the glyph coverage Satori needs.
 */
async function vazirmatn(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@700&display=swap",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    ).then((r) => r.text());
    const url = css.match(/src: url\((https:\/\/[^)]+\.(?:woff2?|ttf))\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const font = await vazirmatn();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0B0B0C",
          padding: "0 96px",
          fontFamily: font ? "Vazirmatn" : undefined,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: "#D4AF6A",
            fontSize: 26,
            letterSpacing: 2,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 9999,
              background: "#D4AF6A",
            }}
          />
          طاها حسینی
        </div>

        <div
          style={{
            marginTop: 28,
            color: "#F5F0E8",
            fontSize: 92,
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          می‌سازمش، چون می‌بینمش.
        </div>

        <div
          style={{
            marginTop: 26,
            color: "#A89178",
            fontSize: 34,
            lineHeight: 1.5,
          }}
        >
          سنتز علوم انسانی و مهندسی نرم‌افزار
        </div>

        <div
          style={{
            marginTop: 44,
            width: 180,
            height: 3,
            background: "#D4AF6A",
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "Vazirmatn", data: font, weight: 700 as const, style: "normal" as const }]
        : undefined,
    }
  );
}
