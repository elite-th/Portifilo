"use client";

import type { KeyboardEvent } from "react";
import type { EntryDTO } from "@/lib/entries";
import { toPersianDigits, toShamsi } from "@/lib/shamsi";
import styles from "./EntryCard.module.css";

/* =========================================================
 * ArticleCard — هویت مقاله (Task 23 §3.2)
 * Book-chapter feel. Clean, structured, typographic. Strong h3
 * headline + excerpt (3-line clamp) + reading time + tags.
 * Background: --bg-elevated with a thin border.
 *
 * DTO mapping:
 *   - title       → entry.title
 *   - excerpt     → entry.excerpt ?? first 140 chars of content
 *   - readingTime → toPersianDigits(entry.readingTime) + " دقیقه"
 *   - tags        → entry.tags (max 3 shown, "ناتمام" filtered out)
 *   - date        → toShamsi(entry.createdAt) → "۱۴۰۲/۰۵/۲۰"
 * ========================================================= */

interface ArticleCardProps {
  entry: EntryDTO;
  onClick: (id: string) => void;
  reducedMotion: boolean;
}

export function ArticleCard({ entry, onClick }: ArticleCardProps) {
  const dateStr = toShamsi(new Date(entry.createdAt));
  const excerpt =
    entry.excerpt ?? entry.content.slice(0, 140).trim() + "…";
  const visibleTags = entry.tags.filter((t) => t !== "ناتمام").slice(0, 3);

  const handleKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(entry.id);
    }
  };

  return (
    <article
      className={styles.article}
      onClick={() => onClick(entry.id)}
      onKeyDown={handleKey}
      tabIndex={0}
      role="button"
      aria-label={`مقاله: ${entry.title}${
        entry.readingTime != null
          ? `، ${toPersianDigits(entry.readingTime)} دقیقه مطالعه`
          : ""
      }`}
    >
      <div className={styles.articleHeader}>
        <span className={styles.articleType}>مقاله</span>
        <time className={styles.articleDate} dateTime={entry.createdAt}>
          {dateStr}
        </time>
      </div>

      <h3 className={styles.articleTitle}>{entry.title}</h3>

      <p className={styles.articleExcerpt}>{excerpt}</p>

      <div className={styles.articleFooter}>
        {entry.readingTime != null && (
          <span className={styles.readingTime}>
            <span className={styles.readingIcon} aria-hidden="true">
              ◷
            </span>
            {toPersianDigits(entry.readingTime)} دقیقه
          </span>
        )}
        {visibleTags.length > 0 && (
          <div className={styles.articleTags}>
            {visibleTags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default ArticleCard;
