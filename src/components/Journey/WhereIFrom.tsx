"use client";

import { type CSSProperties } from "react";
import styles from "./WhereIFrom.module.css";
import { useScrollReveal } from "./useScrollReveal";

/* =========================================================
 * WhereIFrom — §۳ «از کجا میام»  (Separation)
 * accent: var(--accent-2) — olive
 * ---------------------------------------------------------
 * "Minimal Tehran Night" — animated SVG (Task 45-B):
 *   Layer 1 — Night sky: gradient (bg → bg-soft → bg-elevated)
 *             + 6 hand-tuned twinkle stars + crescent moon
 *             with a soft breathing halo
 *   Layer 2 — Horizon: a single thin accent line at y=185
 *   Layer 3 — Taha's window: a small lit rect (the only
 *             "city" element) with an opacity pulse + an
 *             expanding halo aura
 *   Stamp   — ۰۲:۱۴ clock under the horizon, subtle blink
 *
 * Animations (CSS keyframes — see WhereIFrom.module.css):
 *   - starTwinkle   : stars fade in/out (3s, staggered)
 *   - moonGlow      : moon halo opacity breath (5s)
 *   - clockBlink    : 02:14 stamp subtle blink (4s)
 *   - windowPulse   : Taha's window opacity + glow (2.5s)
 *   - haloExpand    : Taha's window aura scale + fade (3s)
 *
 * Concept: شیک، مینیمال، چشم‌نواز — like a quiet Japanese
 * painting of Tehran at 02:14 AM. Independent of scroll-reveal
 * (the night is always alive). SSR-safe (no Math.random).
 * ========================================================= */

const delay = (ms: number): CSSProperties =>
  ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

const PARAGRAPHS: string[] = [
  "ساعتِ ۲:۱۴ صبحِ یه روزِ عادیِ دی. لپ‌تاپ روی تخت، چراغِ مطالعه روی میز، اینترنت نصفه قطع. ایده‌ای که الان داشتم، تا صبح یا فراموش می‌شه یا شکل می‌گیره.",
  "صبح‌ها توی مترو، خطِ یک، از شرق تا میدانِ آزادی. ده‌هزار آدمِ غرقِ گوشی. من وسطشون یادداشت می‌زنم — گاهی روی گوشی، گاهی روی کاغذ، گاهی پشتِ بلیط.",
  "اینترنت قطع می‌شه. هنوز کد می‌زنم. وقتی وصل شد، سینک می‌شه. این تجربه‌ی زیسته‌ی تهرانه — و همه‌ی پروژه‌هام از همین واقعیت آب خوردن.",
];

/* ---------------------------------------------------------
 * Hand-tuned star positions (no Math.random — SSR-safe,
 * no hydration mismatch). 6 minimal stars across the sky.
 * --------------------------------------------------------- */
type Star = { x: number; y: number; r: number; delay: number };

const STARS: Star[] = [
  { x: 38, y: 28, r: 1.0, delay: 0.0 },
  { x: 82, y: 52, r: 0.8, delay: 0.6 },
  { x: 128, y: 22, r: 1.1, delay: 1.2 },
  { x: 178, y: 60, r: 0.8, delay: 1.8 },
  { x: 208, y: 36, r: 0.9, delay: 0.9 },
  { x: 296, y: 80, r: 0.8, delay: 1.5 },
];

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
            از تهران — شهری که خواب نداره، منم ندارم.
          </h2>
        </header>

        <div className={styles.fromGrid}>
          {/* === Minimal Tehran Night (SVG) === */}
          <div className={styles.mapWrap} style={delay(200)}>
            <svg
              viewBox="0 0 320 240"
              className={styles.cityMap}
              role="img"
              aria-label="انیمیشن مینیمالِ شبِ تهران: آسمان شب با ستاره‌های چشمک‌زن، هلال ماه با هاله‌ی نرم، خط افق، پنجره‌ی روشنِ طاها که می‌تپد، و مهرِ ساعت ۰۲:۱۴"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="whereifrom-night-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--bg)" />
                  <stop offset="60%" stopColor="var(--bg-soft)" />
                  <stop offset="100%" stopColor="var(--bg-elevated)" />
                </linearGradient>
                <radialGradient id="whereifrom-moon-halo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
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

              {/* Stars — 6 minimal, hand-tuned */}
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

              {/* Moon — crescent with breathing halo */}
              <g aria-hidden="true">
                <circle
                  cx="250"
                  cy="52"
                  r="22"
                  fill="url(#whereifrom-moon-halo)"
                  className={styles.moonHalo}
                />
                <path
                  d="M 250 38 A 14 14 0 1 0 250 66 A 11 11 0 1 1 250 38 Z"
                  fill="var(--accent)"
                  opacity="0.85"
                />
              </g>

              {/* === Layer 2: Horizon — a single thin accent line === */}
              <line
                x1="0"
                y1="185"
                x2="320"
                y2="185"
                stroke="var(--accent)"
                strokeWidth="0.5"
                opacity="0.3"
                aria-hidden="true"
              />

              {/* === Layer 3: Taha's window — the only lit "city" element === */}
              <rect
                x="152"
                y="157"
                width="16"
                height="21"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="0.5"
                opacity="0.4"
                className={styles.tahaHalo}
                aria-hidden="true"
              />
              <rect
                x="155"
                y="160"
                width="10"
                height="15"
                fill="var(--accent)"
                className={styles.tahaWindow}
                aria-hidden="true"
              />

              {/* ۰۲:۱۴ clock stamp — below horizon, links to paragraph 1 */}
              <text
                x="160"
                y="205"
                fontSize="8"
                fill="var(--muted)"
                textAnchor="middle"
                fontFamily="var(--font-mono, monospace)"
                className={styles.clock}
                aria-hidden="true"
              >
                ۰۲:۱۴
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
