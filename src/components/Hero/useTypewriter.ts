"use client";

import { useEffect, useRef, useState } from "react";

/* =========================================================
 * useTypewriter
 * -------------
 * Types `text` one grapheme at a time using requestAnimationFrame
 * and elapsed-time tracking (no setInterval — keeps things smooth
 * under throttling and tab-background conditions).
 *
 * Grapheme splitting uses Intl.Segmenter({granularity:'grapheme'})
 * with a regex fallback for older browsers. Both paths are critical
 * for Persian text (so "می‌کنه" doesn't render as "م ی ک ن ه").
 *
 * Pause rhythm (non-uniform, per design spec §4.1):
 *   `. ، ؛ — :`  → 90ms (sentence breath)
 *   ` `           → 50ms (shorter)
 *   digits (FA/EN) → 40ms (precision)
 *   default       → 32ms (base)
 *
 * If `reducedMotion` is true, the full text is returned instantly.
 * If `active` is false, `typed` retains its last value (does NOT reset to "").
 *   This lets CSS animate the text during trace/aborting/resetting states.
 *   `typed` only clears when `active` flips back to true (fresh start).
 *
 * Implementation note: prop-change-driven resets are handled in the
 * render phase (the React-blessed "adjusting state when a prop
 * changes" pattern) instead of inside an effect. This avoids the
 * React 19 `react-hooks/set-state-in-effect` lint rule, which flags
 * synchronous setState calls in effect bodies as cascading-render
 * risks. The rAF-driven setState calls happen asynchronously inside
 * the frame callback, which the rule does not flag.
 * ========================================================= */

const BASE_DELAY_MS = 32;
const PAUSE_PUNCT_MS = 90;
const PAUSE_SPACE_MS = 50;
const PAUSE_DIGIT_MS = 40;

/** Punctuation that triggers a 90ms breath pause. */
const PUNCT_CHARS = new Set([".", "،", "؛", "—", ":"]);

function isDigitChar(ch: string): boolean {
  // Persian/Arabic-Indic digits + ASCII digits.
  return /[\u06F0-\u06F9\u0660-\u06690-9]/.test(ch);
}

/**
 * Split text into grapheme clusters.
 * Prefers Intl.Segmenter (correct handling of combining marks, ZWNJ, etc.).
 * Falls back to a regex that handles the common Persian cases.
 */
function splitGraphemes(text: string): string[] {
  // Intl.Segmenter is available in modern browsers (Chrome 87+, Safari 14.1+,
  // Firefox 125+). Wrap in try/catch — some environments expose it but throw
  // on certain locale/option combos.
  if (typeof Intl !== "undefined") {
    const SegmenterCtor = (
      Intl as unknown as { Segmenter?: unknown }
    ).Segmenter;
    if (typeof SegmenterCtor === "function") {
      try {
        const Seg = SegmenterCtor as new (
          locale?: string | string[],
          options?: { granularity?: "grapheme" | "word" | "sentence" }
        ) => {
          segment: (input: string) => Iterable<{ segment: string }>;
        };
        const seg = new Seg("fa", { granularity: "grapheme" });
        const out: string[] = [];
        for (const { segment } of seg.segment(text)) {
          out.push(segment);
        }
        if (out.length > 0) return out;
      } catch {
        // fall through to regex
      }
    }
  }

  // Regex fallback: keep ZWNJ as its own token (it renders correctly when
  // joined back). \p{L} letters, \p{M} marks, \p{N} numbers, \p{P} punct,
  // \s whitespace, plus U+200C explicitly.
  const matches = text.match(
    /(\u200c|\p{L}|\p{M}|\p{N}|\p{P}|\s)/gu
  );
  return matches ?? (text ? [text] : []);
}

/** Cumulative delay before each grapheme becomes visible. */
function delayForGrapheme(ch: string): number {
  if (PUNCT_CHARS.has(ch)) return PAUSE_PUNCT_MS;
  if (ch === " ") return PAUSE_SPACE_MS;
  if (isDigitChar(ch)) return PAUSE_DIGIT_MS;
  return BASE_DELAY_MS;
}

export interface UseTypewriterResult {
  /** Text typed so far (joined graphemes). */
  typed: string;
  /** True once the full `text` has been revealed. */
  isDone: boolean;
}

export function useTypewriter(
  text: string,
  active: boolean,
  reducedMotion: boolean,
  /**
   * Loop-8 (animation 6): delay (ms) before the type-write starts after
   * `active` flips to true. Gives Worker B's ink-spread CSS animation
   * (`.inkSpread` — dot→line) a head start so the ink line "writes" the
   * path the type-write then "fills". Defaults to 0 (no delay).
   *
   * The delay is skipped when `reducedMotion` is true (text appears
   * instantly, no animation to gate against).
   */
  startDelay: number = 0
): UseTypewriterResult {
  const [typed, setTyped] = useState<string>("");
  const [isDone, setIsDone] = useState<boolean>(false);

  const startRef = useRef<number>(0);
  const graphemesRef = useRef<string[]>([]);
  const accumRef = useRef<number[]>([]);

  // Precompute graphemes + cumulative delays whenever text changes.
  // This effect only mutates refs (no setState) — safe per the lint rule.
  useEffect(() => {
    const graphemes = splitGraphemes(text);
    graphemesRef.current = graphemes;
    const acc: number[] = new Array(graphemes.length);
    let sum = 0;
    for (let i = 0; i < graphemes.length; i++) {
      acc[i] = sum;
      sum += delayForGrapheme(graphemes[i]);
    }
    accumRef.current = acc;
  }, [text]);

  // --- Render-phase state adjustment on prop transitions --------------
  // (React-blessed pattern, avoids setState-in-effect.)
  //
  // Key behavior: `typed` is ONLY cleared when starting a fresh type-write
  // (active flips true). When active flips false, `typed` retains its value
  // so CSS can animate the text during trace/aborting/resetting states
  // (blur, fade, dissolve). The rAF loop is stopped by the effect cleanup
  // below — no further graphemes are revealed.
  //
  // `startDelay` is intentionally excluded from `transitionKey` — it's a
  // constant per call site (e.g., INK_SPREAD_DELAY_MS) and including it
  // would force a reset if it ever changed, which we don't want.
  const transitionKey = `${active ? "1" : "0"}-${reducedMotion ? "1" : "0"}-${text}`;
  const [prevTransition, setPrevTransition] = useState<string>(transitionKey);
  const [wasActive, setWasActive] = useState<boolean>(active);
  if (prevTransition !== transitionKey) {
    setPrevTransition(transitionKey);
    if (active && !wasActive) {
      // Fresh activation: clear and start type-write (or instant if reduced).
      if (reducedMotion) {
        setTyped(text);
        setIsDone(true);
      } else {
        setTyped("");
        setIsDone(false);
      }
    } else if (active && wasActive) {
      // `text` or `reducedMotion` changed while active — restart.
      if (reducedMotion) {
        setTyped(text);
        setIsDone(true);
      } else {
        setTyped("");
        setIsDone(false);
      }
    }
    // If !active: do NOT clear `typed` — let CSS animate the lingering text.
    setWasActive(active);
  }

  // --- rAF typewriter effect ------------------------------------------
  // Only runs when active && !reducedMotion. The setState calls inside the
  // rAF callback are asynchronous and not flagged by set-state-in-effect.
  //
  // Loop-8 (animation 6): if `startDelay > 0`, the rAF is gated behind a
  // `setTimeout(startDelay)` so Worker B's ink-spread animation gets a
  // head start. Both the timeout and the rAF are cleaned up on unmount
  // or prop change.
  useEffect(() => {
    if (!active || reducedMotion) return;

    const graphemes = graphemesRef.current;
    const acc = accumRef.current;
    if (graphemes.length === 0) return;

    startRef.current = 0;
    let rafId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const step = (ts: number): void => {
      if (startRef.current === 0) startRef.current = ts;
      const elapsed = ts - startRef.current;

      // Binary search: largest index i with acc[i] <= elapsed.
      let lo = 0;
      let hi = graphemes.length - 1;
      let count = 0;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (acc[mid] <= elapsed) {
          count = mid + 1;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }

      setTyped(graphemes.slice(0, count).join(""));

      if (count >= graphemes.length) {
        setIsDone(true);
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(step);
    };

    const beginTypewriter = (): void => {
      startRef.current = 0;
      rafId = requestAnimationFrame(step);
    };

    if (startDelay > 0) {
      timeoutId = setTimeout(beginTypewriter, startDelay);
    } else {
      beginTypewriter();
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, [active, reducedMotion, text, startDelay]);

  return { typed, isDone };
}
