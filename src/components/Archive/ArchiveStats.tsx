"use client";

import type { StatsDTO } from "@/lib/entries";
import { toPersianDigits } from "@/lib/shamsi";
import type { Filter } from "./Archive";
import styles from "./Archive.module.css";

/* =========================================================
 * ArchiveStats — month summary (Task 23 §8).
 * "این ماه: ۱۲ توشه · ۳ مقاله · ۲ شعر"
 * Each number is a button — click toggles that type's filter.
 * Persian digits via toPersianDigits (Worker A's shamsi.ts).
 *
 * Stats shape (per Worker A's entries.ts StatsDTO):
 *   { total, byType: { TOSHEH, ARTICLE, POEM },
 *     thisMonth, currentMonthLabel }
 * The label is shown as the prefix ("مرداد ۱۴۰۳:").
 * ========================================================= */

interface ArchiveStatsProps {
  stats: StatsDTO;
  filter: Filter;
  onFilterChange: (f: Filter) => void;
}

interface StatOption {
  /** Filter value applied when this stat is clicked. */
  value: Exclude<Filter, "all">;
  /** Count to display. */
  count: number;
  /** Persian unit label. */
  unit: string;
}

export function ArchiveStats({
  stats,
  filter,
  onFilterChange,
}: ArchiveStatsProps) {
  const options: readonly StatOption[] = [
    { value: "TOSHEH", count: stats.byType.TOSHEH, unit: "توشه" },
    { value: "ARTICLE", count: stats.byType.ARTICLE, unit: "مقاله" },
    { value: "POEM", count: stats.byType.POEM, unit: "شعر" },
  ];

  return (
    <div
      className={styles.stats}
      role="group"
      aria-label="آمار توشه‌ی مغز"
    >
      <span className={styles.statsLabel}>
        {stats.currentMonthLabel || "این ماه"}:
      </span>
      {options.map((opt, i) => (
        <StatButton
          key={opt.value}
          option={opt}
          active={filter === opt.value}
          onClick={() =>
            onFilterChange(filter === opt.value ? "all" : opt.value)
          }
          showSeparator={i < options.length - 1}
        />
      ))}
    </div>
  );
}

interface StatButtonProps {
  option: StatOption;
  active: boolean;
  onClick: () => void;
  showSeparator: boolean;
}

function StatButton({
  option,
  active,
  onClick,
  showSeparator,
}: StatButtonProps) {
  return (
    <>
      <button
        type="button"
        className={styles.statButton}
        onClick={onClick}
        aria-pressed={active}
      >
        <span className={styles.statNumber}>
          {toPersianDigits(option.count)}
        </span>
        <span className={styles.statUnit}>{option.unit}</span>
      </button>
      {showSeparator && (
        <span className={styles.statSeparator} aria-hidden="true">
          ·
        </span>
      )}
    </>
  );
}

export default ArchiveStats;
