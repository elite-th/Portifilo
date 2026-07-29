"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CommandDot } from "./components/CommandDot";
import { EntryForm } from "./EntryForm";
import styles from "./Dashboard.module.css";

type EntryType = "TOSHEH" | "ARTICLE" | "POEM";

interface StatsByType {
  TOSHEH?: number;
  ARTICLE?: number;
  POEM?: number;
  tosheh?: number;
  article?: number;
  poem?: number;
}

interface EntriesResponse {
  stats?: {
    byType?: StatsByType;
    total?: number;
    thisMonth?: number;
    currentMonthLabel?: string;
  };
}

const TYPES: { id: EntryType; label: string }[] = [
  { id: "TOSHEH", label: "توشه" },
  { id: "ARTICLE", label: "مقاله" },
  { id: "POEM", label: "شعر" },
];

const TYPE_ORDER: EntryType[] = ["TOSHEH", "ARTICLE", "POEM"];

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
function toPersianDigits(input: number | string): string {
  return String(input).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

function readStat(stats: StatsByType | null | undefined, type: EntryType): number | null {
  if (!stats) return null;
  const upper = stats[type];
  if (typeof upper === "number") return upper;
  const lower = (
    type === "TOSHEH" ? stats.tosheh : type === "ARTICLE" ? stats.article : stats.poem
  );
  return typeof lower === "number" ? lower : null;
}

export function Dashboard({ username, onLogout }: DashboardProps) {
  const [activeType, setActiveType] = useState<EntryType>("TOSHEH");
  const [stats, setStats] = useState<StatsByType | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Fetch stats once on mount — API موجود (GET /api/entries → {stats.byType})
  useEffect(() => {
    let cancelled = false;
    fetch("/api/entries", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: EntriesResponse | null) => {
        if (cancelled || !data) return;
        if (data.stats?.byType) {
          setStats(data.stats.byType);
        }
      })
      .catch(() => {
        /* silent — stats are decorative, not critical */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keyboard navigation between tabs (RTL: ArrowLeft = next, ArrowRight = prev)
  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, current: EntryType) => {
      const idx = TYPE_ORDER.indexOf(current);
      let nextIdx: number | null = null;
      if (e.key === "ArrowLeft") nextIdx = (idx + 1) % 3;
      else if (e.key === "ArrowRight") nextIdx = (idx + 2) % 3;
      else if (e.key === "Home") nextIdx = 0;
      else if (e.key === "End") nextIdx = 2;
      if (nextIdx === null) return;
      e.preventDefault();
      setActiveType(TYPE_ORDER[nextIdx]);
      const buttons = tabsRef.current?.querySelectorAll<HTMLButtonElement>(
        `[role="tab"]`,
      );
      buttons?.[nextIdx]?.focus();
    },
    [],
  );

  const statTiles = TYPES;

  return (
    <div className={styles.page}>
      <div className={styles.ambient} aria-hidden="true" />

      <div className={styles.inner}>
        {/* 1. Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <CommandDot state="active" />
            <div>
              <h1 className={styles.title}>فرماندهی طاها</h1>
              <p className={styles.user}>
                وارد شده به‌عنوان{" "}
                <span dir="ltr" className={styles.username}>
                  {username}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className={styles.logout}
            type="button"
          >
            <LogoutIcon />
            <span>خروج از فرماندهی</span>
          </button>
        </header>
        <div className={styles.divider} aria-hidden="true" />

        {/* 2. Stats sidebar (horizontal) */}
        <div
          className={styles.statsRow}
          role="group"
          aria-label="آمار آرشیو"
        >
          {statTiles.map(({ id: type, label }, i) => {
            const value = readStat(stats, type);
            const display = value === null ? "—" : toPersianDigits(value);
            return (
              <button
                key={type}
                type="button"
                className={styles.statTile}
                data-type={type}
                data-active={activeType === type ? "true" : "false"}
                onClick={() => setActiveType(type)}
                aria-pressed={activeType === type}
                style={{ animationDelay: `${0.05 + i * 0.06}s` }}
              >
                <span className={styles.statIcon} aria-hidden="true">
                  <TypeIcon type={type} />
                </span>
                <span className={styles.statNumber}>{display}</span>
                <span className={styles.statUnit}>{label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Tabs */}
        <nav
          ref={tabsRef}
          className={styles.tabs}
          aria-label="نوع محتوا"
          role="tablist"
          aria-orientation="horizontal"
        >
          {TYPES.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeType === t.id}
              tabIndex={activeType === t.id ? 0 : -1}
              className={styles.tab}
              data-type={t.id}
              data-active={activeType === t.id ? "true" : "false"}
              onClick={() => setActiveType(t.id)}
              onKeyDown={(e) => handleTabKeyDown(e, t.id)}
              style={{ animationDelay: `${0.18 + i * 0.06}s` }}
            >
              <span className={styles.tabIcon} aria-hidden="true">
                <TypeIcon type={t.id} />
              </span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* 4. Form */}
        <main className={styles.main}>
          <EntryForm key={activeType} type={activeType} />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;

// ─── Inline SVG icons ────────────────────────────────────────────────────────
function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: 16, height: 16 }}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function TypeIcon({ type }: { type: EntryType }) {
  if (type === "TOSHEH") {
    // raw dot — golden
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ width: 16, height: 16 }}
      >
        <path d="M5 19c4-1 7-4 7-7s-3-6-7-7c-1 4 0 9 0 14z" />
        <circle cx="5" cy="19" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (type === "ARTICLE") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ width: 16, height: 16 }}
      >
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="17" x2="14" y2="17" />
      </svg>
    );
  }
  // POEM — leaf / sage
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: 16, height: 16 }}
    >
      <path d="M20 4C10 4 4 10 4 18c0 0 6 0 9-3s7-9 7-11z" />
      <path d="M4 18c4-4 8-7 12-9" />
    </svg>
  );
}
