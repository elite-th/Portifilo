"use client";

import { type CSSProperties } from "react";
import styles from "./WhereIGo.module.css";
import { useScrollReveal } from "./useScrollReveal";

/* =========================================================
 * WhereIGo — §۴ «کجا میرم»  (Conjunction)
 * accent: var(--accent-bright) — bright gold
 * ---------------------------------------------------------
 * Future-facing timeline with four waypoints: now → 1404 → later
 * → ∞. The horizontal line draws from right-to-left (RTL) when
 * the section reveals. Dots pop with spring easing + glow halo.
 * On hover, the halo expands and the content shifts slightly.
 * On narrow screens, the timeline collapses to a vertical rail
 * that draws top-to-bottom.
 * ========================================================= */

const delay = (ms: number): CSSProperties =>
  ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

interface Waypoint {
  year: string;
  title: string;
  desc: string;
}

const WAYPOINTS: Waypoint[] = [
  {
    year: "الان",
    title: "ساختن ابزار برای ذهنِ خودم",
    desc:
      "Taskino، Mind 2.0، یادداشت‌های روزانه. هر ابزار پاسخی به یک مشکلِ واقعیِ خودم است.",
  },
  {
    year: "۱۴۰۴",
    title: "نوشتن و حرف زدن",
    desc:
      "تبدیلِ یادداشت‌های پراکنده به مقاله و سخنرانی. اشتراک‌گذاریِ روشِ کیمیاگری با دیگران.",
  },
  {
    year: "بعدش",
    title: "ابزارهای فکریِ عمومی",
    desc:
      "از tool-for-self به tool-for-many. ساختنِ زیرساخت برای کسانی که می‌خواهند مثل من فکر کنند.",
  },
  {
    year: "∞",
    title: "آموزشِ نسلِ بعد از کیمیاگران",
    desc:
      "هر کیمیاگری روزی شاگرد می‌گیرد. اینجا، جایی است که دایره‌ی دانش بسته می‌شود — و دوباره باز.",
  },
];

export default function WhereIGo() {
  const { ref } = useScrollReveal<HTMLDivElement>({
    threshold: 0.15,
    rootMargin: "0px 0px -10% 0px",
    once: true,
  });

  return (
    <section
      id="whereigo"
      ref={ref}
      className={styles.whereIGo}
      data-journey-section="4"
      aria-labelledby="go-title"
    >
      <div className={styles.inner}>
        <header className={styles.sectionHeader}>
          <span className={styles.kicker} style={delay(0)}>
            <span className={styles.kickerDot} aria-hidden="true" />
            §۴ · کجا میرم
          </span>
          <h2 id="go-title" className={styles.title} style={delay(120)}>
            یک خطِ زمانی که هنوز تمام نشده.
          </h2>
        </header>

        <div className={styles.timelineWrap}>
          {/* Horizontal rail that draws RTL on reveal (vertical on mobile) */}
          <div className={styles.rail} aria-hidden="true">
            <div className={styles.railFill} />
          </div>

          <ol className={styles.timeline} role="list">
            {WAYPOINTS.map((wp, i) => (
              <li
                key={wp.year}
                className={styles.timelineItem}
                style={delay(200 + i * 140)}
                role="listitem"
              >
                <span className={styles.timelineDot} aria-hidden="true" />
                <div className={styles.timelineContent}>
                  <span className={styles.timelineYear}>{wp.year}</span>
                  <h3 className={styles.timelineTitle}>{wp.title}</h3>
                  <p className={styles.timelineDesc}>{wp.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
