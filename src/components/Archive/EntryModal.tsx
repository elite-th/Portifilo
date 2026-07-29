"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { EntryDTO } from "@/lib/entries";
import { toShamsi, toPersianDigits } from "@/lib/shamsi";
import { useTypewriter } from "@/components/Hero/useTypewriter";
import styles from "./EntryModal.module.css";

/* =========================================================
 * EntryModal — detail view (Task 23 §6)
 * One modal component, three layouts based on entry.type:
 *   - TOSHEH  → sticky-note card with raw→refined typewriter
 *   - ARTICLE → scrollable prose with paragraphs
 *   - POEM    → centered poem, no card, lots of space
 *
 * Behaviour:
 *   - Backdrop click closes.
 *   - Escape closes.
 *   - Focus is trapped (Tab cycles inside the modal).
 *   - Body scroll is locked while open.
 *   - The close button receives initial focus.
 *
 * Note: we use an overlay <div> (not native <dialog>) so we
 * can drive the raw→refined transition precisely (Task 23
 * §6.1 spec uses overlay divs).
 * ========================================================= */

interface EntryModalProps {
  /** The fetched detail entry. Null while loading. */
  entry: EntryDTO | null;
  /** True if fetchEntry failed — modal renders an error state. */
  hasError: boolean;
  onClose: () => void;
  reducedMotion: boolean;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function EntryModal({
  entry,
  hasError,
  onClose,
  reducedMotion,
}: EntryModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  /* ----- body scroll lock ----- */
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  /* ----- focus management: store trigger, focus first element on open ----- */
  useEffect(() => {
    if (typeof document !== "undefined") {
      previouslyFocusedRef.current =
        document.activeElement as HTMLElement | null;
    }
    const el = dialogRef.current;
    if (!el) return;
    const focusables = Array.from(
      el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((node) => !node.hasAttribute("disabled"));
    focusables[0]?.focus();
  }, [entry]);

  /* ----- restore focus on unmount ----- */
  useEffect(() => {
    return () => {
      previouslyFocusedRef.current?.focus();
    };
  }, []);

  /* ----- Escape to close ----- */
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  /* ----- Tab focus trap ----- */
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const el = dialogRef.current;
      if (!el) return;
      const focusables = Array.from(
        el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((node) => !node.hasAttribute("disabled") && node.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleBackdropClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleStop = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    /* Allow ESC on the dialog itself too. */
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={entry ? entry.title : "نمایش جزئیات"}
    >
      <div
        ref={dialogRef}
        className={styles.modal}
        data-type={entry?.type ?? "loading"}
        onClick={handleStop}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="بستن"
        >
          ×
        </button>

        {hasError ? (
          <div className={styles.errorState}>
            <p>خطا در بارگذاری این مورد.</p>
            <button
              type="button"
              className={styles.errorButton}
              onClick={onClose}
            >
              بستن
            </button>
          </div>
        ) : entry === null ? (
          <div className={styles.loadingState} aria-hidden="true">
            <span className={styles.loadingDot} />
            <span className={styles.loadingDot} />
            <span className={styles.loadingDot} />
          </div>
        ) : entry.type === "TOSHEH" ? (
          <ToshehDetail entry={entry} reducedMotion={reducedMotion} />
        ) : entry.type === "ARTICLE" ? (
          <ArticleDetail entry={entry} />
        ) : (
          <PoemDetail entry={entry} />
        )}
      </div>
    </div>
  );
}

export default EntryModal;

/* =========================================================
 * ToshehDetail — raw → refined typewriter (Task 23 §6.1)
 * Reuses Hero's useTypewriter for visual continuity with the
 * "Knowledge Alchemy" concept: clicking a raw fragment in
 * the archive triggers the same raw→refined transformation
 * the user saw in the Hero scattered-thought cluster.
 *
 * DTO mapping:
 *   - "raw" phase     → entry.title (the short fragment)
 *   - "refined" phase → entry.content (the elaborated thought)
 *   - mood / source   → entry.mood / entry.source (header chips)
 *   - date            → toShamsi(entry.createdAt) full short form
 * ========================================================= */

function ToshehDetail({
  entry,
  reducedMotion,
}: {
  entry: EntryDTO;
  reducedMotion: boolean;
}) {
  const [phase, setPhase] = useState<"raw" | "refining" | "refined">("raw");

  const { typed, isDone } = useTypewriter(
    entry.content,
    phase === "refining" || phase === "refined",
    reducedMotion,
    230
  );

  /* After mount + 800ms, switch to refining (starts the typewriter). */
  useEffect(() => {
    const t = setTimeout(() => setPhase("refining"), 800);
    return () => clearTimeout(t);
  }, []);

  /* Render-phase: when isDone flips true, advance phase to "refined".
     Avoids setState-during-effect. */
  const [prevIsDone, setPrevIsDone] = useState<boolean>(isDone);
  if (prevIsDone !== isDone) {
    setPrevIsDone(isDone);
    if (isDone) setPhase("refined");
  }

  const isUnfinished = entry.tags.includes("ناتمام");
  const dateStr = toShamsi(new Date(entry.createdAt));

  return (
    <div className={styles.toshehDetail}>
      <div className={styles.toshehHeader}>
        <span className={styles.rawDot} aria-hidden="true">
          •
        </span>
        {entry.mood && <span className={styles.mood}>{entry.mood}</span>}
        {entry.source && (
          <span className={styles.source}>← {entry.source}</span>
        )}
      </div>

      {/* Raw fragment — italic, fades out when phase advances. */}
      <p
        className={styles.rawText}
        data-hidden={phase !== "raw" ? "true" : "false"}
      >
        {entry.title}
      </p>

      {/* Refined text — typewriter. */}
      {(phase === "refining" || phase === "refined") && (
        <p className={styles.refinedText}>
          {typed}
          {!isDone && (
            <span className={styles.cursor} aria-hidden="true">
              ▍
            </span>
          )}
        </p>
      )}

      <div
        className={styles.footer}
        data-shown={phase === "refined" ? "true" : "false"}
      >
        <time dateTime={entry.createdAt}>{dateStr}</time>
        {isUnfinished && (
          <span className={styles.unfinishedTag}>ناتمام</span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
 * ArticleDetail — scrollable prose with paragraphs.
 * DTO mapping: content is split by blank lines into paragraphs.
 * ========================================================= */

function ArticleDetail({ entry }: { entry: EntryDTO }) {
  const paragraphs = entry.content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const dateStr = toShamsi(new Date(entry.createdAt));
  const visibleTags = entry.tags.filter((t) => t !== "ناتمام");

  return (
    <article className={styles.articleDetail}>
      <header className={styles.articleHeader}>
        <span className={styles.typeLabel}>مقاله</span>
        <time dateTime={entry.createdAt}>{dateStr}</time>
      </header>

      <h2 className={styles.articleTitle}>{entry.title}</h2>

      {entry.excerpt && (
        <p className={styles.articleLead}>{entry.excerpt}</p>
      )}

      <div className={styles.articleMeta}>
        {entry.readingTime != null && (
          <span className={styles.articleMetaItem}>
            <span className={styles.readingIcon} aria-hidden="true">
              ◷
            </span>
            {toPersianDigits(entry.readingTime)} دقیقه مطالعه
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

      <div className={styles.prose}>
        {paragraphs.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </article>
  );
}

/* =========================================================
 * PoemDetail — centered poem, lots of space, no card feel.
 * ========================================================= */

function PoemDetail({ entry }: { entry: EntryDTO }) {
  const lines = entry.content.split("\n");
  const dateStr = toShamsi(new Date(entry.createdAt));

  return (
    <div className={styles.poemDetail}>
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
    </div>
  );
}

/* =========================================================
 * Helpers
 * ========================================================= */
