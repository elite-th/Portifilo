"use client";

import { useScrollReveal } from "@/components/Journey/useScrollReveal";
import styles from "./ProjectCard.module.css";

export interface ProjectCardData {
  rootThought: string;
  builtStructure: string;
  project: string;
  tags: string[];
  href?: string;
  /** شماره‌ی نمونه در آزمایشگاه — برای SPEC ID و stagger */
  index?: number;
}

export default function ProjectCard({
  rootThought,
  builtStructure,
  project,
  tags,
  href,
  index = 0,
}: ProjectCardData) {
  const { ref, revealed } = useScrollReveal<HTMLElement>({
    threshold: 0.12,
    rootMargin: "0px 0px -10% 0px",
  });
  const gradId = `specimen-grad-${index}`;
  const specId = `SPEC-${String(index + 1).padStart(2, "0")}`;

  return (
    <article
      ref={ref}
      className={styles.card}
      data-project={project}
      data-revealed={revealed ? "true" : undefined}
      style={{ "--card-index": index } as React.CSSProperties}
    >
      {/* قابِ ابزار — گوشه‌های نشانه‌گیری */}
      <span className={styles.frame} aria-hidden="true" />
      {/* پرتوی اسکن — یک بار روی hover عبور می‌کند */}
      <span className={styles.scanline} aria-hidden="true" />

      {/* --- نوارِ ابزار --- */}
      <div className={styles.instrument}>
        <span className={styles.specId}>{specId}</span>
        <span className={styles.readout}>
          <span className={styles.led} aria-hidden="true" />
          {tags.length.toLocaleString("fa-IR")} شاخص
        </span>
      </div>

      <header className={styles.cardHeader}>
        {/* نمونه — بلورِ زیرِ مشاهده */}
        <span className={styles.specimen} aria-hidden="true">
          <svg viewBox="0 0 60 60">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--card-accent-bright, #e6c585)" />
                <stop offset="100%" stopColor="var(--card-accent-deep, #b08d4a)" />
              </linearGradient>
            </defs>
            {/* حلقه‌ی هدف */}
            <circle
              className={styles.specimenRing}
              cx="30"
              cy="30"
              r="27"
              fill="none"
              stroke="var(--line)"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
            {/* بدنه‌ی بلور */}
            <polygon
              className={styles.specimenBody}
              points="30,6 51,18 51,42 30,54 9,42 9,18"
              fill={`url(#${gradId})`}
              fillOpacity="0.12"
              stroke={`url(#${gradId})`}
              strokeWidth="1.4"
            />
            {/* وجه‌ها */}
            <g
              className={styles.specimenFacets}
              stroke={`url(#${gradId})`}
              strokeWidth="0.9"
              opacity="0.65"
            >
              <path d="M30 6 V54" />
              <path d="M9 18 L51 42" />
              <path d="M51 18 L9 42" />
            </g>
            <circle
              className={styles.specimenCore}
              cx="30"
              cy="30"
              r="3"
              fill="var(--card-accent-bright, #e6c585)"
            />
          </svg>
        </span>

        <h3 className={styles.projectName}>{project}</h3>
      </header>

      {/* --- ثبتِ آزمایش --- */}
      <div className={styles.log}>
        <div className={styles.entry} data-kind="hypothesis">
          <span className={styles.entryLabel}>فرضیه</span>
          <p className={styles.hypothesis}>{rootThought}</p>
        </div>

        {/* واکنش — pip یک بار مسیر را طی می‌کند */}
        <div className={styles.reaction} aria-hidden="true">
          <span className={styles.reactionTrack} />
          <span className={styles.reactionPip} />
        </div>

        <div className={styles.entry} data-kind="observation">
          <span className={styles.entryLabel}>مشاهده</span>
          <p className={styles.observation}>{builtStructure}</p>
        </div>
      </div>

      <footer className={styles.cardFooter}>
        <div className={styles.tags}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>

        {href && (
          <a
            href={href}
            className={styles.link}
            aria-label={`مشاهده‌ی کریستال ${project}`}
          >
            <span>مشاهده‌ی کریستال</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </footer>
    </article>
  );
}
