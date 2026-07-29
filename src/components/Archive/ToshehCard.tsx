"use client";

import type { KeyboardEvent } from "react";
import type { EntryDTO } from "@/lib/entries";
import { toRelative } from "@/lib/shamsi";
import styles from "./EntryCard.module.css";

/* =========================================================
 * ToshehCard — هویت توشه (Task 23 §3.1)
 * Sticky-note feel. Small, daily, raw. The golden raw-dot (•)
 * sits next to the mood tag; the body is italic-lite Persian
 * text. Date is relative ("۳ روز پیش") to feel alive.
 *
 * DTO mapping:
 *   - body preview → entry.title (the raw fragment, short)
 *   - mood tag     → entry.mood (optional)
 *   - source       → entry.source (optional)
 *   - date         → relativeShamsi(entry.createdAt)
 *   - unfinished   → derived from a "ناتمام" tag in entry.tags
 * ========================================================= */

interface ToshehCardProps {
  entry: EntryDTO;
  onClick: (id: string) => void;
  reducedMotion: boolean;
}

export function ToshehCard({ entry, onClick }: ToshehCardProps) {
  const isUnfinished = entry.tags.includes("ناتمام");
  const relative = toRelative(new Date(entry.createdAt));

  const handleKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(entry.id);
    }
  };

  return (
    <article
      className={styles.tosheh}
      data-unfinished={isUnfinished ? "true" : "false"}
      onClick={() => onClick(entry.id)}
      onKeyDown={handleKey}
      tabIndex={0}
      role="button"
      aria-label={`توشه: ${entry.title}، ${relative}`}
    >
      <div className={styles.toshehHeader}>
        <span className={styles.rawDot} aria-hidden="true">
          •
        </span>
        {entry.mood && (
          <span className={styles.toshehMood}>{entry.mood}</span>
        )}
      </div>

      <p className={styles.toshehBody}>{entry.title}</p>

      <div className={styles.toshehMeta}>
        <time className={styles.toshehDate} dateTime={entry.createdAt}>
          {relative}
        </time>
        {entry.source && (
          <span className={styles.toshehSource}>{entry.source}</span>
        )}
      </div>
    </article>
  );
}

export default ToshehCard;
