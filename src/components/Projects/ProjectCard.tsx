"use client";

import { useScrollReveal } from "@/components/Journey/useScrollReveal";
import styles from "./ProjectCard.module.css";

export interface ProjectCardData {
  rootThought: string;
  builtStructure: string;
  project: string;
  tags: string[];
  href?: string;
  /** شماره‌ی کارت در grid — برای crystal gradient ID و index badge */
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
  const gradId = `crystal-grad-${index}`;

  return (
    <article
      ref={ref}
      className={styles.card}
      data-project={project}
      data-revealed={revealed ? "true" : undefined}
      style={{ "--card-index": index } as React.CSSProperties}
    >
      {/* Facet glow (top edge) */}
      <span className={styles.facetTop} aria-hidden="true" />

      {/* Crystal seed — hexagon SVG که نماینده‌ی پروژه است */}
      <div className={styles.crystalSeed} aria-hidden="true">
        <svg
          className={styles.crystalSvg}
          viewBox="0 0 60 60"
          width="52"
          height="52"
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--card-accent-bright, #e6c585)" />
              <stop offset="100%" stopColor="var(--card-accent-deep, #b08d4a)" />
            </linearGradient>
          </defs>
          <polygon
            points="30,4 54,18 54,42 30,56 6,42 6,18"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="1.5"
            className={styles.crystalShape}
          />
          <polygon
            points="30,12 46,21 46,39 30,48 14,39 14,21"
            fill={`url(#${gradId})`}
            opacity="0.16"
            className={styles.crystalInner}
          />
          {/* facet lines */}
          <line x1="30" y1="4" x2="30" y2="12" stroke={`url(#${gradId})`} strokeWidth="1" opacity="0.6" className={styles.crystalFacet} />
          <line x1="54" y1="18" x2="46" y2="21" stroke={`url(#${gradId})`} strokeWidth="1" opacity="0.6" className={styles.crystalFacet} />
          <line x1="54" y1="42" x2="46" y2="39" stroke={`url(#${gradId})`} strokeWidth="1" opacity="0.6" className={styles.crystalFacet} />
          <line x1="30" y1="56" x2="30" y2="48" stroke={`url(#${gradId})`} strokeWidth="1" opacity="0.6" className={styles.crystalFacet} />
          <line x1="6" y1="42" x2="14" y2="39" stroke={`url(#${gradId})`} strokeWidth="1" opacity="0.6" className={styles.crystalFacet} />
          <line x1="6" y1="18" x2="14" y2="21" stroke={`url(#${gradId})`} strokeWidth="1" opacity="0.6" className={styles.crystalFacet} />
        </svg>
      </div>

      <header className={styles.cardHeader}>
        <h3 className={styles.projectName}>{project}</h3>
        <span className={styles.projectIndex} aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
      </header>

      <div className={styles.transformation}>
        <div className={styles.beforeAfter}>
          <span className={styles.label}>
            <span className={styles.labelIcon} aria-hidden="true">⬡</span>
            اندیشه‌ی ریشه
          </span>
          <p className={styles.rootThought}>{rootThought}</p>
        </div>

        <div className={styles.arrow} aria-hidden="true">
          <svg width="20" height="40" viewBox="0 0 20 40" fill="none">
            <line
              x1="10"
              y1="2"
              x2="10"
              y2="32"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <polyline
              points="4,28 10,36 16,28"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className={styles.beforeAfter}>
          <span className={styles.label}>
            <span className={styles.labelIcon} aria-hidden="true">◇</span>
            ساختارِ ساخته‌شده
          </span>
          <p className={styles.builtStructure}>{builtStructure}</p>
        </div>
      </div>

      <footer className={styles.cardFooter}>
        <div className={styles.tags}>
          {tags.map((tag, i) => (
            <span key={i} className={styles.tag}>
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
