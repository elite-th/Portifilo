"use client";

import { type CSSProperties, type ReactNode } from "react";
import styles from "./WhatIBuild.module.css";
import { useScrollReveal } from "./useScrollReveal";

/* =========================================================
 * WhatIBuild — §۲ «چی می‌سازم»  (Dissolution)
 * accent: var(--text) — cream (gold steps back so text steps up)
 * ---------------------------------------------------------
 * Three parallel threads that intersect: Taskino, Mind 2.0,
 * Humanities × Code. Each is an inline-SVG icon + name + desc.
 * Scroll-reveal: cards stagger 0ms / 120ms / 240ms.
 * Hover: card lifts, border warms, icon scales.
 * ========================================================= */

const delay = (ms: number): CSSProperties =>
  ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

interface BuildItem {
  id: string;
  name: string;
  desc: string;
  icon: ReactNode;
}

const ITEMS: BuildItem[] = [
  {
    id: "taskino",
    name: "Taskino",
    desc:
      "شبکه‌ی معناییِ اولویت‌ها. وقتی لیست‌های خطی جواب نمی‌دهند، ذهن را به‌جای صف، در یک گراف مدل می‌کند.",
    icon: (
      <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <polygon points="24,6 40,15 40,33 24,42 8,33 8,15" />
        <circle cx="24" cy="6" r="2.5" fill="currentColor" />
        <circle cx="40" cy="15" r="2.5" fill="currentColor" />
        <circle cx="40" cy="33" r="2.5" fill="currentColor" />
        <circle cx="24" cy="42" r="2.5" fill="currentColor" />
        <circle cx="8" cy="33" r="2.5" fill="currentColor" />
        <circle cx="8" cy="15" r="2.5" fill="currentColor" />
        <circle cx="24" cy="24" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "mind2",
    name: "Mind 2.0",
    desc:
      "معماریِ دومین مغز. کاهشِ entropy شناختی — وقتی بیشمار مسیر جلویت باز است، انتخاب از تصمیم سخت‌تر می‌شود.",
    icon: (
      <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <polygon points="24,4 44,24 24,44 4,24" />
        <polygon points="24,12 36,24 24,36 12,24" />
        <line x1="24" y1="4" x2="24" y2="12" />
        <line x1="44" y1="24" x2="36" y2="24" />
        <line x1="24" y1="44" x2="24" y2="36" />
        <line x1="4" y1="24" x2="12" y2="24" />
      </svg>
    ),
  },
  {
    id: "humxcode",
    name: "Humanities × Code",
    desc:
      "کد به‌مثابه‌ی هرمنوتیکِ مدرن. فلسفه specification می‌دهد، کد implementation. مهندسی نرم‌افزار، رشته‌ی انسانیِ کاربردی است.",
    icon: (
      <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="18" cy="24" r="12" />
        <circle cx="30" cy="24" r="12" />
        <text x="24" y="29" textAnchor="middle" fontSize="13" fill="currentColor" fontFamily="monospace" stroke="none">×</text>
      </svg>
    ),
  },
];

export default function WhatIBuild() {
  const { ref } = useScrollReveal<HTMLDivElement>({
    threshold: 0.15,
    rootMargin: "0px 0px -10% 0px",
    once: true,
  });

  return (
    <section
      id="whatibuild"
      ref={ref}
      className={styles.whatIBuild}
      data-journey-section="2"
      aria-labelledby="build-title"
    >
      <div className={styles.inner}>
        <header className={styles.sectionHeader}>
          <span className={styles.kicker} style={delay(0)}>
            <span className={styles.kickerDot} aria-hidden="true" />
            §۲ · چی می‌سازم
          </span>
          <h2 id="build-title" className={styles.title} style={delay(120)}>
            سه خطِ موازی که در یک نقطه تقاطع می‌کنند.
          </h2>
        </header>

        <div className={styles.buildGrid} role="list">
          {ITEMS.map((item, i) => (
            <article
              key={item.id}
              className={styles.buildCard}
              style={delay(220 + i * 120)}
              role="listitem"
            >
              <div className={styles.buildIcon} aria-hidden="true">
                {item.icon}
              </div>
              <h3 className={styles.buildName}>{item.name}</h3>
              <p className={styles.buildDesc}>{item.desc}</p>
              <span className={styles.cardIndex} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
