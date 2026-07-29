"use client";

import styles from "./ProjectCard.module.css";

export interface ProjectCardData {
  rootThought: string;
  builtStructure: string;
  project: string;
  tags: string[];
  href?: string;
}

export default function ProjectCard({ rootThought, builtStructure, project, tags, href }: ProjectCardData) {
  return (
    <article className={styles.card} data-project={project}>
      <header className={styles.header}>
        <span className={styles.projectName}>{project}</span>
      </header>

      <div className={styles.content}>
        <div className={styles.column}>
          <span className={styles.label}>اندیشه‌ی ریشه</span>
          <p className={styles.value}>{rootThought}</p>
        </div>

        <div className={styles.arrow} aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>

        <div className={styles.column}>
          <span className={styles.label}>ساختارِ ساخته‌شده</span>
          <p className={styles.value}>{builtStructure}</p>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.tags}>
          {tags.map((tag, i) => (
            <span key={i} className={styles.tag}>{tag}</span>
          ))}
        </div>

        {href && (
          <a href={href} className={styles.link} aria-label={`مشاهده ${project}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span>مشاهده</span>
          </a>
        )}
      </footer>
    </article>
  );
}