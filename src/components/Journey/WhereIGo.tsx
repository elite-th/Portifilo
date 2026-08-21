"use client";

import { type CSSProperties } from "react";
import styles from "./WhereIGo.module.css";
import { useScrollReveal } from "./useScrollReveal";

/* =========================================================
 * WhereIGo — §۴ «کجا میرم»  (Conjunction)
 * accent: var(--accent-bright) — bright verdigris
 * ---------------------------------------------------------
 * Future-facing timeline with four waypoints. Labels are
 * RELATIVE ("امسال", "سال بعد") — never hard years, so the
 * section can't expire the way a literal "۱۴۰۴" did.
 *
 * Horizontal rail draws RTL on reveal; dots are progress rings
 * filled to a fraction (100% → 66% → 33% → 0%) matching the
 * footnote's claim. Cards dim via border/background only;
 * body text keeps a readable contrast floor.
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
      "هر چی ساختم، اول مشکل خودم بوده. اگه برای خودم کار نکنه، برای کسی هم کار نمی‌کنه.",
  },
  {
    year: "امسال",
    title: "چیزی که بشه نشون داد",
    desc:
      "Taskino باید از حالت «فقط برای من کار می‌کنه» در بیاد و برسه به جایی که بشه دست کس دیگه‌ای داد.",
  },
  {
    year: "دو سال بعد",
    title: "درس، و مستند کردن مسیر",
    desc:
      "دو سال آینده بیشتر درس می‌خونم تا کد. ولی یادداشت‌های پراکنده رو می‌شه مرتب کرد و تبدیلشون کرد به یه راهنما برای بقیه.",
  },
  {
    year: "هدف",
    title: "ابزاری که مستقل کار کنه",
    desc:
      "چیزی که ساخته بودم، خودش زنده باشه. نه وابسته به من، نه وابسته به یه سرور خاص.",
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
            کجا میرم
          </span>
          <h2 id="go-title" className={styles.title} style={delay(120)}>
            خطِ زمانیِ خودم
          </h2>
        </header>

        <div className={styles.timelineWrap}>
          {/* Rail that draws RTL on reveal (vertical on mobile). */}
          <div className={styles.rail} aria-hidden="true">
            <div className={styles.railFill} />
          </div>

          <ol className={styles.timeline} role="list" aria-label="خط زمانی آینده">
            {WAYPOINTS.map((wp, i) => (
              <li
                key={wp.year}
                className={styles.timelineItem}
                data-step={i}
                style={delay(200 + i * 140)}
                role="listitem"
              >
                <span className={styles.timelineDot} aria-hidden="true">
                  <span className={styles.dotCore} />
                </span>
                <div className={styles.timelineCard}>
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineYear}>{wp.year}</span>
                    <h3 className={styles.timelineTitle}>{wp.title}</h3>
                    <p className={styles.timelineDesc}>{wp.desc}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className={styles.timelineFootnote} style={delay(900)}>
          دایره‌ی «الان» پره، دایره‌ی «هدف» خالیه. کار همینه — پر کردنشون.
        </p>
      </div>
    </section>
  );
}