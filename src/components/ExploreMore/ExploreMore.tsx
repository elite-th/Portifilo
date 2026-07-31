"use client";

import { type CSSProperties, type ReactNode } from "react";
import styles from "./ExploreMore.module.css";
import { useScrollReveal } from "@/components/Journey/useScrollReveal";

/* =========================================================
 * ExploreMore — «اگه وقت داری، بیشتر هست.»
 * ---------------------------------------------------------
 * A quiet gateway placed right after <ArchiveClient /> on
 * the home page. Three cards point the reader to deeper
 * paths beyond the portfolio itself:
 *
 *   1. همکاری با من  → #collab   — how to work with me, no guessing
 *   2. توشه‌ی مغز   → #archive  — monthly learnings (existing Archive)
 *   3. خلوتگاه      → #sanctum  — poetry & prose, no explanation
 *
 * Choreography follows the rest of the journey: uses the
 * shared useScrollReveal hook so the section's `data-revealed`
 * attribute flips on enter, and each card staggers via its
 * own `--reveal-delay` CSS variable.
 *
 * Owned by Worker C (Task 42-C). Do not edit without
 * coordinating — class names are listed in the CSS header.
 * ========================================================= */

const delay = (ms: number): CSSProperties =>
  ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

interface ExploreCard {
  title: string;
  desc: string;
  href: string;
  icon: ReactNode;
}

const CARDS: ExploreCard[] = [
  {
    title: "همکاری با من",
    desc: "چطور باهام کار کنی، بدونِ حدس‌زدن.",
    href: "#collab",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m11 17 2 2a1 1 0 1 0 3-3" />
        <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
        <path d="m21 3 1 11h-2" />
        <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
        <path d="M3 4h8" />
      </svg>
    ),
  },
  {
    title: "توشه‌ی مغز",
    desc: "چیزهایی که هر ماه یاد می‌گیرم و می‌فهمم.",
    href: "#archive",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="2.6" />
        <circle cx="4.8" cy="6" r="1.8" />
        <circle cx="19.2" cy="6" r="1.8" />
        <circle cx="4.8" cy="18" r="1.8" />
        <circle cx="19.2" cy="18" r="1.8" />
        <path d="M6.4 7 10 10.4" />
        <path d="M17.6 7 14 10.4" />
        <path d="M6.4 17 10 13.6" />
        <path d="M17.6 17 14 13.6" />
      </svg>
    ),
  },
  {
    title: "خلوتگاه",
    desc: "شعر و نوشته. بدونِ توضیح.",
    href: "#sanctum",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
        <line x1="16" y1="8" x2="2" y2="22" />
        <line x1="17.5" y1="15" x2="9" y2="15" />
      </svg>
    ),
  },
];

export default function ExploreMore() {
  const { ref } = useScrollReveal<HTMLElement>({
    threshold: 0.12,
    rootMargin: "0px 0px -8% 0px",
    once: true,
  });

  return (
    <section
      id="explore"
      ref={ref}
      className={styles.explore}
      aria-labelledby="explore-title"
    >
      <div className={styles.ambient} aria-hidden="true" />

      <div className={styles.container}>
        <p className={styles.kicker} style={delay(0)}>
          می‌خوای بیشتر بشناسیم؟
        </p>

        <h2 id="explore-title" className={styles.title} style={delay(80)}>
          اگه وقت داری، بیشتر هست.
        </h2>

        <div className={styles.grid}>
          {CARDS.map((card, i) => (
            <a
              key={card.href}
              href={card.href}
              className={styles.card}
              style={delay(200 + i * 120)}
            >
              <span className={styles.arrow} aria-hidden="true">
                ↗
              </span>
              <span className={styles.icon} aria-hidden="true">
                {card.icon}
              </span>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDesc}>{card.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
