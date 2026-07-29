"use client";

import type { KeyboardEvent } from "react";
import type { EntryDTO } from "@/lib/entries";
import { toShamsi } from "@/lib/shamsi";
import styles from "./EntryCard.module.css";

/* =========================================================
 * PoemCard — هویت شعر (Task 23 §3.3) — NO CARD!
 * The poem floats directly on the section background.
 * No background, no border, no box-shadow — only padding,
 * center alignment, sage color (--accent-2), and a hairline
 * rule below. This is the imperfection that makes poems
 * feel suspended rather than boxed.
 *
 * DTO mapping:
 *   - lines      → entry.content.split("\n")
 *   - emotion    → entry.emotion (small uppercase label above)
 *   - dedicatedTo → entry.dedicatedTo ("برای ..." italic at bottom)
 *   - date       → toShamsi(entry.createdAt) → "۱۴۰۲/۰۵/۲۰"
 * ========================================================= */

interface PoemCardProps {
  entry: EntryDTO;
  onClick: (id: string) => void;
  reducedMotion: boolean;
}

export function PoemCard({ entry, onClick }: PoemCardProps) {
  /* Poem body: split content by newlines. Preserve blank lines as
     non-breaking spaces so they take vertical space (spacers between
     stanzas — important for poem rhythm). */
  const lines = entry.content.split("\n");
  const dateStr = toShamsi(new Date(entry.createdAt));

  const handleKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(entry.id);
    }
  };

  return (
    <article
      className={styles.poem}
      onClick={() => onClick(entry.id)}
      onKeyDown={handleKey}
      tabIndex={0}
      role="button"
      aria-label={`شعر${entry.emotion ? ` با حال‌وهوای ${entry.emotion}` : ""}`}
    >
      {entry.emotion && (
        <span className={styles.poemEmotion}>{entry.emotion}</span>
      )}

      <div className={styles.poemBody}>
        {lines.map((line, i) => (
          <p key={i} className={styles.poemLine}>
            {line === "" ? "\u00A0" : line}
          </p>
        ))}
      </div>

      <div className={styles.poemRule} aria-hidden="true" />

      <div className={styles.poemFooter}>
        {entry.dedicatedTo && (
          <span className={styles.poemDedicate}>برای {entry.dedicatedTo}</span>
        )}
        <time className={styles.poemDate} dateTime={entry.createdAt}>
          {dateStr}
        </time>
      </div>
    </article>
  );
}

export default PoemCard;
