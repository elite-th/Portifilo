"use client";

import type { EntryType } from "@/lib/entries";
import type { Filter } from "./Archive";
import styles from "./Archive.module.css";

/* =========================================================
 * ArchiveFilters — four-button type filter (Task 23 §7).
 * Buttons: [همه] [توشه‌ها] [مقاله‌ها] [شعرها]
 * Active state: aria-pressed + accent fill (matches stat buttons).
 *
 * This is a controlled component — the parent owns `filter`.
 * ========================================================= */

interface ArchiveFiltersProps {
  filter: Filter;
  onChange: (f: Filter) => void;
}

interface FilterOption {
  value: Filter;
  label: string;
}

const OPTIONS: readonly FilterOption[] = [
  { value: "all", label: "همه" },
  { value: "TOSHEH", label: "توشه‌ها" },
  { value: "ARTICLE", label: "مقاله‌ها" },
  { value: "POEM", label: "شعرها" },
];

export function ArchiveFilters({
  filter,
  onChange,
}: ArchiveFiltersProps) {
  return (
    <div
      className={styles.filters}
      role="group"
      aria-label="فیلتر نوع محتوا"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={styles.filterButton}
          onClick={() => onChange(opt.value as Filter | EntryType)}
          aria-pressed={filter === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default ArchiveFilters;
