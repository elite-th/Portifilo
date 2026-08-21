"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchEntries,
  fetchEntry,
} from "@/lib/entries";
import type { EntryDTO, EntryType, StatsDTO } from "@/lib/entries";
import { useReducedMotion } from "@/components/Hero/useReducedMotion";
import { EntryCard } from "./EntryCard";
import { EntryModal } from "./EntryModal";
import { ArchiveFilters } from "./ArchiveFilters";
import { ArchiveStats } from "./ArchiveStats";
import styles from "./Archive.module.css";

/* =========================================================
 * Archive — «توشه‌ی مغز»
 * Container component (client). Owns:
 *   - filter state ("all" | "TOSHEH" | "ARTICLE" | "POEM")
 *   - selectedId state (which entry's modal is open)
 *   - list data (entries + stats) via fetchEntries()
 *   - detail data via fetchEntry()
 *
 * Lifecycle:
 *   1. On mount → fetch all entries + stats.
 *   2. On filter change → refetch (Worker A's fetchEntries takes "all" | EntryType).
 *   3. On entry click → set selectedId → fetch detail → render modal.
 *   4. On modal close → clear selectedId + selectedEntry.
 *
 * Masonry: CSS `columns` (3→2→1). Stagger entrance via
 * REVEAL_STAGGER_MS (intentionally irregular — Task 23 §5.3).
 * Each item flips `data-entered` from "false" → "true" once
 * scrolled into view (IntersectionObserver).
 * ========================================================= */

export type Filter = "all" | EntryType;

/** Irregular stagger — feels more natural than linear 80ms steps. */
const REVEAL_STAGGER_MS: readonly number[] = [
  0, 140, 70, 210, 110, 280, 50, 180, 350, 90, 250, 130,
];

const EMPTY_STATS: StatsDTO = {
  total: 0,
  byType: { TOSHEH: 0, ARTICLE: 0, POEM: 0 },
  thisMonth: 0,
  currentMonthLabel: "",
};

export function Archive() {
  const reducedMotion = useReducedMotion();

  const [entries, setEntries] = useState<EntryDTO[]>([]);
  const [stats, setStats] = useState<StatsDTO>(EMPTY_STATS);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<EntryDTO | null>(null);
  const [modalError, setModalError] = useState<boolean>(false);

  /* retryCounter — bumps to force a refetch with the same filter. */
  const [retryCount, setRetryCount] = useState<number>(0);

  /* ----- render-phase state sync: when filter changes, reset loading/error.
     This avoids setState-during-effect (React-blessed "derived state" pattern). ----- */
  const [prevFilter, setPrevFilter] = useState<Filter>(filter);
  if (prevFilter !== filter) {
    setPrevFilter(filter);
    setLoading(true);
    setError(null);
  }

  /* ----- render-phase: when selectedId changes, clear stale detail state. ----- */
  const [prevSelectedId, setPrevSelectedId] = useState<string | null>(selectedId);
  if (prevSelectedId !== selectedId) {
    setPrevSelectedId(selectedId);
    setSelectedEntry(null);
    setModalError(false);
  }

  /* ----- list fetch (re-runs on filter or retry change) ----- */
  useEffect(() => {
    let cancelled = false;
    fetchEntries(filter)
      .then((res) => {
        if (cancelled) return;
        setEntries(res.entries);
        setStats(res.stats);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("خطا در بارگذاری توشه‌ها. لطفاً دوباره تلاش کنید.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter, retryCount]);

  /* ----- detail fetch (re-runs when selectedId changes) ----- */
  useEffect(() => {
    if (selectedId === null) return;
    let cancelled = false;
    fetchEntry(selectedId)
      .then((entry) => {
        if (cancelled) return;
        setSelectedEntry(entry);
      })
      .catch(() => {
        if (cancelled) return;
        setModalError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    setRetryCount((c) => c + 1);
  }, []);

  return (
    <section id="archive" className={styles.archive}>
      <div className={styles.archiveInner}>
        <header className={styles.header}>
          <span className={styles.kicker}>دفترچه‌ی ذهن</span>
          <h2 className={styles.title}>چیزهایی که در من مانده‌اند</h2>
          <p className={styles.subtitle}>
            یادداشت‌ها، مقاله‌ها و شعرهایی که نشان می‌دهند طاها بیرون از پروژه‌ها چطور فکر می‌کند.
          </p>
        </header>

        <ArchiveStats
          stats={stats}
          filter={filter}
          onFilterChange={setFilter}
        />

        <ArchiveFilters filter={filter} onChange={setFilter} />

        {/* screen-reader-only live region — announces filtered count */}
        <div className={styles.srOnly} aria-live="polite">
          {loading
            ? "در حال بارگذاری."
            : `${entries.length} مورد نمایش داده می‌شود.`}
        </div>

        {error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <button
              type="button"
              className={styles.errorButton}
              onClick={handleRetry}
            >
              تلاش دوباره
            </button>
          </div>
        ) : loading ? (
          <div className={styles.loading} aria-hidden="true">
            <span className={styles.loadingDot} />
            <span className={styles.loadingDot} />
            <span className={styles.loadingDot} />
          </div>
        ) : entries.length === 0 ? (
          <p className={styles.empty}>هنوز چیزی در این فیلتر ثبت نشده.</p>
        ) : (
          <Masonry entries={entries} onSelect={handleSelect} reducedMotion={reducedMotion} />
        )}
      </div>

      {selectedId !== null && (
        <EntryModal
          entry={selectedEntry}
          hasError={modalError}
          onClose={handleClose}
          reducedMotion={reducedMotion}
        />
      )}
    </section>
  );
}

export default Archive;

/* =========================================================
 * Masonry — internal component. Owns the IntersectionObserver
 * that flips each item's `data-entered` from "false" → "true".
 * Splitting this out keeps Archive.tsx focused on data flow.
 * ========================================================= */

interface MasonryProps {
  entries: EntryDTO[];
  onSelect: (id: string) => void;
  reducedMotion: boolean;
}

function Masonry({ entries, onSelect, reducedMotion }: MasonryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [enteredIds, setEnteredIds] = useState<Set<string>>(() => new Set());

  // Single shared IntersectionObserver (Phase B) — one observer for all items
  // instead of N observers. Reduces work on filter changes with many entries.
  useEffect(() => {
    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync visible state for reduced-motion/no-IO fallback
      setEnteredIds(new Set(entries.map((e) => e.id)));
      return;
    }
    const container = containerRef.current;
    if (!container) return;
    const observed = new Set<string>();
    const io = new IntersectionObserver(
      (items) => {
        let changed = false;
        for (const item of items) {
          if (item.isIntersecting) {
            const id = (item.target as HTMLElement).dataset.entryId;
            if (id && !observed.has(id)) {
              observed.add(id);
              changed = true;
              io.unobserve(item.target);
            }
          }
        }
        if (changed) setEnteredIds(new Set(observed));
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    const els = container.querySelectorAll<HTMLElement>("[data-entry-id]");
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [entries, reducedMotion]);

  // reducedMotion snap — synchronous so first paint is visible
  const shouldSnap = reducedMotion || typeof IntersectionObserver === "undefined";

  return (
    <div ref={containerRef} className={styles.masonry}>
      {entries.map((entry, i) => (
        <MasonryItem
          key={entry.id}
          entry={entry}
          index={i}
          onSelect={onSelect}
          reducedMotion={reducedMotion}
          entered={shouldSnap || enteredIds.has(entry.id)}
        />
      ))}
    </div>
  );
}

interface MasonryItemProps {
  entry: EntryDTO;
  index: number;
  onSelect: (id: string) => void;
  reducedMotion: boolean;
  entered: boolean;
}

function MasonryItem({
  entry,
  index,
  onSelect,
  reducedMotion,
  entered,
}: MasonryItemProps) {
  const delay = reducedMotion
    ? 0
    : REVEAL_STAGGER_MS[index % REVEAL_STAGGER_MS.length];

  return (
    <div
      className={styles.masonryItem}
      data-entry-id={entry.id}
      data-entered={entered ? "true" : "false"}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <EntryCard
        entry={entry}
        onClick={onSelect}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}
