"use client";

import { type CSSProperties } from "react";
import styles from "./WhereIFrom.module.css";
import { useScrollReveal } from "./useScrollReveal";

/* =========================================================
 * WhereIFrom — §۳ «از کجا میام»  (Separation)
 * accent: var(--accent-2) — olive
 * ---------------------------------------------------------
 * Minimal Tehran map + conversational text about the city:
 * metro line 1, 2:14 AM laptop, internet cuts, night thoughts.
 * Scroll-reveal: map scales in, paragraphs fade-in staggered.
 * The pulse dot is independent of scroll (always animating) so
 * the city feels alive.
 * ========================================================= */

const delay = (ms: number): CSSProperties =>
  ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

const PARAGRAPHS: string[] = [
  "ساعت ۲:۱۴ صبحِ یک روزِ عادیِ دی. لپ‌تاپ روی تخت، چراغ مطالعه روی میز، اینترنتِ ایرانتل نصفه قطع. ایده‌ای که الان داشتم تا صبح یا فراموش می‌شود یا تبلور می‌یابد.",
  "صبح‌ها در مترو، خطِ یک، از شرق تا میدانِ آزادی. ده هزار آدمِ غرق در گوشی. من وسطِ آن‌ها یادداشت می‌زنم — گاهی روی گوشی، گاهی روی کاغذ، گاهی روی پشتِ بلیط.",
  "اینترنت قطع می‌شود. هنوز کد می‌زنم. وقتی وصل شد، همگام‌سازی می‌شود. این تجربه‌ی زیسته‌ی تهران است — و همه‌ی پروژه‌هایم از همین واقعیت آب خورده‌اند.",
];

const STATIONS = [60, 100, 140, 180, 220, 260];

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
            از یک شهر که همیشه در حال حرکت است.
          </h2>
        </header>

        <div className={styles.fromGrid}>
          {/* === Map === */}
          <div className={styles.mapWrap} style={delay(200)}>
            <svg
              viewBox="0 0 320 200"
              className={styles.map}
              role="img"
              aria-label="نقشه‌ی مینیمال تهران با خط مترو و نقطه‌ی محله‌ی طاها"
            >
              {/* City outline — irregular shape */}
              <path
                d="M40,60 Q70,30 130,40 Q200,35 250,55 Q290,75 280,130 Q260,170 200,165 Q120,175 70,150 Q30,120 40,60 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="2 4"
                opacity="0.5"
              />
              {/* Metro line 1 — east to west */}
              <line
                x1="50"
                y1="100"
                x2="280"
                y2="100"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.7"
              />
              {/* Stations */}
              {STATIONS.map((x, i) => (
                <circle
                  key={i}
                  cx={x}
                  cy="100"
                  r="2"
                  fill="currentColor"
                  opacity="0.6"
                />
              ))}
              {/* Metro line 3 — diagonal */}
              <line
                x1="80"
                y1="50"
                x2="240"
                y2="160"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.5"
                strokeDasharray="3 3"
              />
              {/* The neighborhood dot — pulsing */}
              <circle
                cx="170"
                cy="105"
                r="6"
                fill="currentColor"
                className={styles.mapPulse}
              />
              <circle
                cx="170"
                cy="105"
                r="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.4"
                className={styles.mapPulseRing}
              />
              <text
                x="180"
                y="98"
                fontSize="9"
                fill="currentColor"
                opacity="0.85"
                fontFamily="var(--font-mono, monospace)"
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
