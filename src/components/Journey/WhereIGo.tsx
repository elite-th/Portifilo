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
    title: "برای خودم می‌سازم",
    desc:
      "هر چی ساختم، اول برای خودم بوده. مشکلِ خودم، راه‌حلِ خودم. اگه برای خودم کار نکنه، برای کسی کار نمی‌کنه.",
  },
  {
    year: "۱۴۰۴",
    title: "از یادداشت به مقاله",
    desc:
      "یادداشت‌های پراکنده، مقاله می‌شن. سخنرانی می‌شن.",
  },
  {
    year: "بعدش",
    title: "از ابزارِ خودم به ابزارِ همه",
    desc:
      "چیزی که برای خودم ساختم، برای کسایی که مثلِ من فکر می‌کنن هم به‌کار میاد.",
  },
  {
    year: "∞",
    title: "شاگرد گرفتن",
    desc:
      "یه روز نوبتِ یاد دادنه. اینجا دایره بسته می‌شه — تا دوباره باز شه.",
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
            خطِ زمانیِ خودم
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
