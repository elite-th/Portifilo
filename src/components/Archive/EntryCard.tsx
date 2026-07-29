"use client";

import type { EntryDTO } from "@/lib/entries";
import { ToshehCard } from "./ToshehCard";
import { ArticleCard } from "./ArticleCard";
import { PoemCard } from "./PoemCard";

/* =========================================================
 * EntryCard — dispatcher.
 * Reads entry.type and renders one of three card variants.
 * Each variant owns its own visual identity (Task 23 §3):
 *   - TOSHEH  → sticky-note, italic lite, gold dot
 *   - ARTICLE → book chapter, h3 + tags + reading time
 *   - POEM    → no card at all (text floats on section bg)
 * ========================================================= */

interface EntryCardProps {
  entry: EntryDTO;
  onClick: (id: string) => void;
  reducedMotion: boolean;
}

export function EntryCard({
  entry,
  onClick,
  reducedMotion,
}: EntryCardProps) {
  switch (entry.type) {
    case "TOSHEH":
      return (
        <ToshehCard
          entry={entry}
          onClick={onClick}
          reducedMotion={reducedMotion}
        />
      );
    case "ARTICLE":
      return (
        <ArticleCard
          entry={entry}
          onClick={onClick}
          reducedMotion={reducedMotion}
        />
      );
    case "POEM":
      return (
        <PoemCard
          entry={entry}
          onClick={onClick}
          reducedMotion={reducedMotion}
        />
      );
    default:
      return null;
  }
}

export default EntryCard;
