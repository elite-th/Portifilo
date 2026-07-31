"use client";

import { type CSSProperties } from "react";
import styles from "./WhereIFrom.module.css";
import { useScrollReveal } from "./useScrollReveal";

/* =========================================================
 * WhereIFrom — §۳ «از کجا میام»  (Separation)
 * accent: var(--accent-2) — olive
 * ---------------------------------------------------------
 * "Living Tehran Night" — animated SVG city (Task 39-C):
 *   Layer 1 — Night sky: 25 twinkle stars + crescent moon
 *             (soft glow) + 02:14 clock stamp
 *   Layer 2 — Skyline: 9 minimal buildings with windows
 *             that twinkle; Taha's building has a halo window
 *   Layer 3 — Metro line 1: horizontal line + 7 stations +
 *             a train that travels along the line + a pulse
 *             dot marking Taha's neighborhood
 *
 * Animations (CSS keyframes, owned by Worker C — see
 * WhereIFrom.module.css header for class-name registry):
 *   - starTwinkle     : stars fade in/out
 *   - moonGlow        : moon soft halo pulse
 *   - windowTwinkle   : building windows flicker
 *   - tahaWindowPulse : Taha's lit window halo
 *   - metroTravel     : train moves along metro line
 *   - tahaPulse       : Taha's dot radius + opacity pulse
 *   - tahaRingExpand  : outer ring expands + fades
 *   - labelFade       : "من اینجام" gentle fade
 *   - clockBlink      : 02:14 clock stamp subtle blink
 *
 * Independent of scroll-reveal (city is always alive).
 * ========================================================= */

const delay = (ms: number): CSSProperties =>
  ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

const PARAGRAPHS: string[] = [
  "ساعت ۲:۱۴ صبحِ یک روزِ عادیِ دی. لپ‌تاپ روی تخت، چراغ مطالعه روی میز، اینترنتِ ایرانتل نصفه قطع. ایده‌ای که الان داشتم تا صبح یا فراموش می‌شود یا تبلور می‌یابد.",
  "صبح‌ها در مترو، خطِ یک، از شرق تا میدانِ آزادی. ده هزار آدمِ غرق در گوشی. من وسطِ آن‌ها یادداشت می‌زنم — گاهی روی گوشی، گاهی روی کاغذ، گاهی روی پشتِ بلیط.",
  "اینترنت قطع می‌شود. هنوز کد می‌زنم. وقتی وصل شد، همگام‌سازی می‌شود. این تجربه‌ی زیسته‌ی تهران است — و همه‌ی پروژه‌هایم از همین واقعیت آب خورده‌اند.",
];

/* ---------------------------------------------------------
 * Hand-tuned star positions (no Math.random — SSR-safe,
 * no hydration mismatch). 25 stars across the upper sky.
 * --------------------------------------------------------- */
type Star = { x: number; y: number; r: number; delay: number };

const STARS: Star[] = [
  { x: 24, y: 18, r: 1.0, delay: 0.0 },
  { x: 52, y: 32, r: 0.8, delay: 0.7 },
  { x: 88, y: 14, r: 1.0, delay: 1.4 },
  { x: 118, y: 38, r: 0.7, delay: 0.3 },
  { x: 152, y: 22, r: 1.0, delay: 1.0 },
  { x: 188, y: 12, r: 0.9, delay: 0.5 },
  { x: 222, y: 36, r: 1.0, delay: 1.2 },
  { x: 258, y: 20, r: 0.8, delay: 0.2 },
  { x: 304, y: 44, r: 0.9, delay: 0.9 },
  { x: 38, y: 56, r: 0.7, delay: 1.6 },
  { x: 74, y: 68, r: 1.0, delay: 0.4 },
  { x: 108, y: 52, r: 0.8, delay: 1.1 },
  { x: 144, y: 64, r: 0.9, delay: 0.6 },
  { x: 176, y: 48, r: 1.0, delay: 1.3 },
  { x: 212, y: 70, r: 0.8, delay: 0.1 },
  { x: 248, y: 58, r: 0.9, delay: 0.8 },
  { x: 282, y: 72, r: 1.0, delay: 1.5 },
  { x: 14, y: 40, r: 0.7, delay: 0.55 },
  { x: 96, y: 26, r: 0.8, delay: 1.45 },
  { x: 168, y: 38, r: 0.9, delay: 0.25 },
  { x: 200, y: 60, r: 0.7, delay: 0.95 },
  { x: 234, y: 14, r: 1.0, delay: 1.35 },
  { x: 272, y: 30, r: 0.8, delay: 0.45 },
  { x: 312, y: 22, r: 0.9, delay: 1.05 },
  { x: 60, y: 82, r: 0.7, delay: 0.15 },
];

/* Metro line stations — 7 dots evenly distributed */
const STATIONS: number[] = [40, 80, 120, 160, 200, 240, 280];

/* ---------------------------------------------------------
 * Building layout. Bottoms at y=240 (ground line), peaks
 * vary. Taha's building (index 3) is the gold-tinted one —
 * its top aligns vertically with the metro pulse dot.
 * --------------------------------------------------------- */
type Building = {
  x: number;
  w: number;
  h: number;
  fill: string;
  isTaha?: boolean;
};

const GROUND_Y = 240;
const METRO_Y = 140;

const BUILDINGS: Building[] = [
  { x: 6, w: 34, h: 70, fill: "rgba(122, 148, 114, 0.12)" },
  { x: 44, w: 28, h: 95, fill: "rgba(122, 148, 114, 0.14)" },
  { x: 76, w: 40, h: 60, fill: "rgba(122, 148, 114, 0.10)" },
  { x: 120, w: 30, h: 110, fill: "rgba(212, 175, 106, 0.18)", isTaha: true },
  { x: 154, w: 36, h: 80, fill: "rgba(122, 148, 114, 0.13)" },
  { x: 194, w: 32, h: 100, fill: "rgba(122, 148, 114, 0.12)" },
  { x: 230, w: 28, h: 65, fill: "rgba(122, 148, 114, 0.11)" },
  { x: 262, w: 38, h: 85, fill: "rgba(122, 148, 114, 0.13)" },
  { x: 304, w: 12, h: 55, fill: "rgba(122, 148, 114, 0.10)" },
];

/* Generate deterministic window positions for a building */
function windowsFor(b: Building): { x: number; y: number; delay: number }[] {
  const cols = b.w >= 32 ? 2 : 1;
  const rows = Math.max(2, Math.min(5, Math.floor(b.h / 22)));
  const winW = 2;
  const winH = 2;
  const xPad = (b.w - cols * winW) / (cols + 1);
  const yTop = GROUND_Y - b.h + 6;
  const yAvail = b.h - 12;
  const yGap = (yAvail - rows * winH) / (rows + 1);
  const out: { x: number; y: number; delay: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Skip the top-left slot on Taha's building — that's where
      // his larger halo window (tahaWindow) lives.
      if (b.isTaha && r === 0 && c === 0) continue;
      out.push({
        x: b.x + xPad * (c + 1) + c * winW,
        y: yTop + yGap * (r + 1) + r * winH,
        delay: (r * 0.4 + c * 0.7 + b.x * 0.02) % 3,
      });
    }
  }
  return out;
}

const TAHA_BUILDING = BUILDINGS.find((b) => b.isTaha) as Building;
const TAHA_WINDOW_X = TAHA_BUILDING.x + 5;
const TAHA_WINDOW_Y = GROUND_Y - TAHA_BUILDING.h + 7;
const TAHA_X = TAHA_BUILDING.x + TAHA_BUILDING.w / 2;

export default function WhereIFrom() {
  const { ref } = useScrollReveal<HTMLDivElement>({
    threshold: 0.15,
    rootMargin: "0px 0px -10% 0px",
    once: true,
  });

  return (
    <section
      id="whereifrom"
      ref={ref}
      className={styles.whereIFrom}
      data-journey-section="3"
      aria-labelledby="from-title"
    >
      <div className={styles.inner}>
        <header className={styles.sectionHeader}>
          <span className={styles.kicker} style={delay(0)}>
            <span className={styles.kickerDot} aria-hidden="true" />
            §۳ · از کجا میام
          </span>
          <h2 id="from-title" className={styles.title} style={delay(120)}>
            از تهران — شهری که خواب ندارد، و من هم ندارم.
          </h2>
        </header>

        <div className={styles.fromGrid}>
          {/* === Living Tehran Night (SVG) === */}
          <div className={styles.mapWrap} style={delay(200)}>
            <svg
              viewBox="0 0 320 240"
              className={styles.cityMap}
              role="img"
              aria-label="انیمیشن شهری شبانه‌ی تهران: آسمان شب با ستاره‌های چشمک‌زن و هلال ماه، خط مترو در حرکت، پنجره‌های روشن، و نقطه‌ی طلایی نشان‌دهنده‌ی محل طاهاست"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="whereifrom-night-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--bg)" />
                  <stop offset="50%" stopColor="var(--bg-soft)" />
                  <stop offset="100%" stopColor="var(--bg)" />
                </linearGradient>
                <radialGradient id="whereifrom-moon-halo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* === Layer 1: Night sky === */}
              <rect
                x="0"
                y="0"
                width="320"
                height="240"
                fill="url(#whereifrom-night-sky)"
              />

              {/* Stars */}
              <g className={styles.stars} aria-hidden="true">
                {STARS.map((s, i) => (
                  <circle
                    key={i}
                    cx={s.x}
                    cy={s.y}
                    r={s.r}
                    fill="var(--text)"
                    className={styles.star}
                    style={{ animationDelay: `${s.delay}s` }}
                  />
                ))}
              </g>

              {/* Moon — crescent with soft halo */}
              <g aria-hidden="true">
                <circle cx="288" cy="30" r="14" fill="url(#whereifrom-moon-halo)" />
                <path
                  d="M 288 22 A 8 8 0 1 0 288 38 A 6 6 0 0 1 288 22 Z"
                  fill="var(--accent)"
                  className={styles.moon}
                />
              </g>

              {/* ۰۲:۱۴ clock stamp — top-left, links to paragraph 1 */}
              <text
                x="14"
                y="22"
                fontSize="7"
                fill="var(--muted)"
                fontFamily="var(--font-mono, monospace)"
                className={styles.clock}
                aria-hidden="true"
              >
                ۰۲:۱۴
              </text>

              {/* === Layer 2: Skyline === */}
              <g className={styles.buildings} aria-hidden="true">
                {BUILDINGS.map((b, i) => (
                  <g key={i}>
                    <rect
                      x={b.x}
                      y={GROUND_Y - b.h}
                      width={b.w}
                      height={b.h}
                      fill={b.fill}
                      stroke="var(--line)"
                      strokeWidth="0.5"
                    />
                    {windowsFor(b).map((w, j) => (
                      <rect
                        key={j}
                        x={w.x}
                        y={w.y}
                        width="2"
                        height="2"
                        fill="var(--accent-2)"
                        className={styles.window}
                        style={{ animationDelay: `${w.delay}s` }}
                      />
                    ))}
                    {b.isTaha && (
                      <rect
                        x={TAHA_WINDOW_X}
                        y={TAHA_WINDOW_Y}
                        width="3"
                        height="3"
                        fill="var(--accent-bright)"
                        className={styles.tahaWindow}
                      />
                    )}
                  </g>
                ))}
              </g>

              {/* === Layer 3: Metro line + train + Taha's pulse === */}
              <line
                x1="20"
                y1={METRO_Y}
                x2="300"
                y2={METRO_Y}
                stroke="var(--accent)"
                strokeWidth="0.8"
                opacity="0.5"
                aria-hidden="true"
              />
              <g aria-hidden="true">
                {STATIONS.map((x, i) => (
                  <circle
                    key={i}
                    cx={x}
                    cy={METRO_Y}
                    r="1.5"
                    fill="var(--accent)"
                    opacity="0.7"
                  />
                ))}
              </g>
              {/* Train — travels along the metro line */}
              <rect
                x="20"
                y={METRO_Y - 2}
                width="8"
                height="4"
                rx="1"
                fill="var(--accent-bright)"
                className={styles.train}
                aria-hidden="true"
              />

              {/* Taha's pulse — on metro line, above his building */}
              <circle
                cx={TAHA_X}
                cy={METRO_Y}
                r="8"
                fill="none"
                stroke="var(--accent-bright)"
                strokeWidth="1"
                opacity="0.4"
                className={styles.tahaRing}
                aria-hidden="true"
              />
              <circle
                cx={TAHA_X}
                cy={METRO_Y}
                r="3"
                fill="var(--accent-bright)"
                className={styles.tahaDot}
                aria-hidden="true"
              />
              <text
                x={TAHA_X + 6}
                y={METRO_Y - 5}
                fontSize="7"
                fill="var(--accent-bright)"
                opacity="0.85"
                fontFamily="var(--font-mono, monospace)"
                className={styles.label}
              >
                من اینجام
              </text>
            </svg>
            <span className={styles.mapCaption}>
              تهران · ۳۵.۶۸۹۲° N, ۵۱.۳۸۹۰° E
            </span>
          </div>

          {/* === Text === */}
          <div className={styles.fromText}>
            {PARAGRAPHS.map((p, i) => (
              <p key={i} className={styles.fromPara} style={delay(320 + i * 120)}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
