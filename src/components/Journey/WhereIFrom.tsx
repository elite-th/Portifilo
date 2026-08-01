"use client";

import { type CSSProperties } from "react";
import styles from "./WhereIFrom.module.css";
import { useScrollReveal } from "./useScrollReveal";

const delay = (ms: number): CSSProperties =>
  ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

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
      {/* نقشه‌ی مینیمال ایران — پس‌زمینه */}
      <div className={styles.mapBg} aria-hidden="true">
        <svg
          viewBox="0 0 800 700"
          className={styles.mapSvg}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* مرز اصلی ایران — fill ملایم + stroke واضح */}
          <path
            d="M400,60 L500,70 L580,100 L660,120 L720,160 L770,210 L750,270 L780,310 L740,360 L700,390 L680,430 L620,480 L660,530 L600,570 L560,540 L520,570 L480,590 L440,560 L400,600 L360,560 L320,580 L280,550 L240,580 L200,540 L160,560 L120,530 L140,490 L100,450 L120,400 L100,360 L140,320 L110,280 L150,240 L130,200 L170,160 L210,130 L260,100 L320,80 L400,60Z"
            fill="var(--bg-elevated)"
            stroke="var(--line)"
            strokeWidth="2"
          />

          {/* خطوط داخلی (استان‌ها) */}
          <path
            d="M400,60 L380,200 L340,300 L320,420 L370,570
               M500,70 L520,210 L560,290 L600,380 L620,500
               M260,100 L230,220 L210,290 L250,400 L230,580
               M660,120 L640,230 L670,320 L700,400 L650,500
               M150,220 L240,250 L320,270 L400,290 L480,310
               M470,330 L540,350 L620,370 L700,390
               M200,430 L320,450 L430,470 L530,490 L620,510"
            fill="none"
            stroke="var(--line)"
            strokeWidth="0.8"
            strokeDasharray="6 5"
            opacity="0.5"
          />

          {/* نقطه‌ی طلایی تهران */}
          <g className={styles.tehranGroup}>
            <circle cx="390" cy="210" r="6" fill="var(--accent)" className={styles.tehranDot} />
            <circle
              cx="390"
              cy="210"
              r="16"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.2"
              className={styles.mapPulse}
            />
            <circle
              cx="390"
              cy="210"
              r="30"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="0.8"
              className={styles.mapPulse}
              style={{ animationDelay: "1.2s" }}
            />
          </g>
        </svg>
      </div>

      <div className={styles.inner}>
        <span className={styles.kicker} style={delay(0)}>
          <span className={styles.kickerDot} aria-hidden="true" />
          از کجا میام
        </span>

        <h2 id="from-title" className={styles.title} style={delay(120)}>
          تهران، شب‌های بی‌خواب.
        </h2>

        <div className={styles.textBlock}>
          <p className={styles.para} style={delay(240)}>
            ساعت ۲:۱۴ صبح. لپ‌تاپ روی تخت روشنه، چراغ مطالعه روی میز، شهر بیرون پنجره هنوز بیداره.
          </p>
          <p className={styles.para} style={delay(360)}>
            اینجا جایی‌ست که ایده‌ها یا تا صبح فراموش می‌شن، یا کد می‌شن. واسه همین کارهام رو جوری می‌سازم که توی مترو هم بشه ادامه‌شون داد.
          </p>
        </div>
      </div>
    </section>
  );
}