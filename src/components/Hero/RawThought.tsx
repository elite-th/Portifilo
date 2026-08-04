"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RawThoughtProps, ThoughtState } from "./types";
import { useTypewriter } from "./useTypewriter";
import styles from "./RawThought.module.css";

/* =========================================================
 * RawThought — single chip
 * -------------------------
 * Local lifecycle (driven by parent's `isActive` prop):
 *
 *   raw ──activate──▶ refining ──type-write done──▶ refined
 *                       │                              │
 *                       │ deactivate (mid-type)        │ deactivate
 *                       ▼                              ▼
 *                   aborting ──600ms──▶ raw     trace (traceDuration)
 *                                                  │
 *                                                  ▼
 *                                             resetting
 *                                                  │
 *                                                  ▼
 *                                                raw
 *
 * Replay (re-hover while in "trace"): skip refining, jump straight
 * to "refined" — typed text is still in memory.
 *
 * Abort (deactivate during "refining"): the user pulled away before
 * the thought finished forming. Instead of leaving a trace, the half-
 * typed text dissolves and raw re-emerges (600ms). No trace dot.
 *
 * Tap (mobile, click handler): toggle. If currently active and the
 * thought is already refined/trace, collapse immediately.
 *
 * Focus protection: `onMouseLeave` is suppressed if the chip itself
 * holds focus (so keyboard users don't lose the refined state until
 * they actually blur).
 *
 * Implementation note: prop-change-driven state transitions use the
 * render-phase "adjusting state when a prop changes" pattern from
 * React docs. The trace/resetting/aborting timers are scheduled via
 * effects whose cleanup owns the timer — the setState calls happen
 * inside setTimeout callbacks (asynchronous), so they don't trigger
 * the `react-hooks/set-state-in-effect` lint rule.
 * ========================================================= */

// Resetting → raw transition duration. In reduced-motion mode it's
// instant (the design spec §4.2 calls for "return-to-raw فوری").
const RESETTING_PHASE_MS = 1200;

// Aborting → raw transition duration. When the user pulls away mid-
// type-write, the half-formed thought dissolves back to raw faster than
// a full reset (no trace dot, no lingering). Reduced-motion = instant.
const ABORTING_PHASE_MS = 600;

/* Eyefish lens effect — see mousemove handler below. */
// Ink-spread delay: ink spread runs 150ms + 80ms fade = 230ms before
// the type-write starts, so the ink line "writes" the path the type-write
// then "fills". See useTypewriter's `startDelay` parameter.
const INK_SPREAD_DELAY_MS = 230;

// sr-only style for the always-present refined-text span (FIX-2: SEO + a11y).
// Kept inline because RawThought.module.css is owned by Worker B and may not
// have a `.srOnly` class. This is the standard "visually hidden" recipe
// (matches Tailwind's `sr-only` and the HTML5 Boilerplate pattern).
const srOnlyStyle: React.CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: "0",
};

export default function RawThought({
  thought,
  layout,
  isActive,
  onActivate,
  onDeactivate,
  reducedMotion,
  onTraceChange,
  resetSignal,
  entered,
  scrollRevealed,
  onRegister,
}: RawThoughtProps) {
  const {
    id,
    raw,
    refined,
    label,
    timestamp,
    mode,
    rotation,
    usesDanger,
    isEscaped,
    traceDuration,
  } = thought;

  const [state, setState] = useState<ThoughtState>("raw");
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // The typewriter is "active" (writing or holding text) during refining,
  // refined, and trace. In aborting/resetting/raw, `active` is false — but
  // we DON'T want useTypewriter to clear `typed` the moment active flips
  // to false, because:
  //  - In "aborting": the half-typed text must stay in the DOM so CSS can
  //    blur+fade it (the dissolve animation).
  //  - In "resetting": the full text must stay so CSS can fade it out.
  //  - In "raw": text is invisible (CSS opacity:0) — harmless if it lingers.
  //
  // useTypewriter is modified to NOT clear `typed` when `active` goes false;
  // it only clears when `active` goes true again (fresh type-write start).
  //
  // Loop-8 (animation 6): a `startDelay` of INK_SPREAD_DELAY_MS (230ms)
  // delays the type-write so the ink-spread dot→line animation (Worker B's
  // CSS on `.inkSpread`) gets a head start. The ink line "writes" the path
  // the type-write then "fills".
  const typerActive =
    state === "refining" || state === "refined" || state === "trace";
  const { typed, isDone } = useTypewriter(
    refined,
    typerActive,
    reducedMotion,
    INK_SPREAD_DELAY_MS
  );

  // Notify parent whenever trace state changes (used for the reset affordance).
  useEffect(() => {
    onTraceChange?.(id, state === "trace");
  }, [state, id, onTraceChange]);

  // --- Render-phase state transitions --------------------------------
  // (React-blessed pattern: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)

  // 1) React to parent's isActive prop transitions.
  const [prevIsActive, setPrevIsActive] = useState<boolean>(isActive);
  if (prevIsActive !== isActive) {
    setPrevIsActive(isActive);
    if (isActive) {
      if (state === "trace") {
        // Replay: skip refining, reveal already-typed text immediately.
        setState("refined");
      } else if (state === "raw" || state === "resetting") {
        // Fresh activation: start typing.
        setState("refining");
      }
      // If already "refined", nothing to do.
    } else {
      if (state === "refining") {
        // Abort mid-type-write: user pulled away before the thought
        // finished forming. Go straight to "aborting" (not "trace") —
        // the half-typed text dissolves and raw re-emerges. This is
        // different from a completed thought leaving a trace.
        setState("aborting");
      } else if (state === "refined") {
        // Deactivation: enter trace state. The trace timer (below) will
        // eventually move us through resetting → raw.
        setState("trace");
      }
    }
  }

  // 2) When type-write completes, transition refining → refined.
  if (state === "refining" && isDone) {
    setState("refined");
  }

  // 3) External reset signal (from the cluster's ↺ button).
  const currentReset = resetSignal ?? 0;
  const [prevResetSignal, setPrevResetSignal] = useState<number>(currentReset);
  if (prevResetSignal !== currentReset && currentReset !== 0) {
    setPrevResetSignal(currentReset);
    setState("resetting");
  }

  // --- Side-effect timers (cleanup owns the timer) -------------------

  // Trace → Resetting transition (fires after traceDuration).
  useEffect(() => {
    if (state !== "trace") return;
    const t = setTimeout(() => {
      setState("resetting");
    }, traceDuration);
    return () => clearTimeout(t);
  }, [state, traceDuration]);

  // Resetting → Raw transition (fires after a brief resetting phase).
  useEffect(() => {
    if (state !== "resetting") return;
    const delay = reducedMotion ? 0 : RESETTING_PHASE_MS;
    const t = setTimeout(() => {
      setState("raw");
    }, delay);
    return () => clearTimeout(t);
  }, [state, reducedMotion]);

  // Aborting → Raw transition (fires after the dissolve animation).
  // No trace dot, no trace state — just a clean return to raw.
  useEffect(() => {
    if (state !== "aborting") return;
    const delay = reducedMotion ? 0 : ABORTING_PHASE_MS;
    const t = setTimeout(() => {
      setState("raw");
    }, delay);
    return () => clearTimeout(t);
  }, [state, reducedMotion]);

  // --- Handlers ------------------------------------------------------

  const handleActivate = useCallback(() => {
    onActivate();
  }, [onActivate]);

  const handleLeave = useCallback(() => {
    // Focus protection: if the chip is currently focused (keyboard nav),
    // keep it active until blur fires. This matters for Tab users who may
    // briefly mouse-out without intending to deactivate.
    if (
      buttonRef.current &&
      document.activeElement === buttonRef.current
    ) {
      return;
    }
    onDeactivate();
  }, [onDeactivate, reducedMotion, layout]);

  const handleToggle = useCallback(() => {
    // Click = tap on mobile. Toggle behaviour:
    //  - if currently active (refined/trace), collapse immediately
    //  - otherwise activate
    if (isActive) {
      onDeactivate();
    } else {
      onActivate();
    }
  }, [isActive, onActivate, onDeactivate]);

  // --- Style ---------------------------------------------------------

  // Position is computed in JS so the escaped-thought override (t6 desktop)
  // works without needing CSS to fight inline styles.
  //
  // Loop-4 (Task 12 §1.3-C): in mobile, chips are arranged by CSS grid
  // (2-column) — no inline top/left. Returning {} lets CSS `position: static`
  // apply cleanly without `!important` wars against inline styles.
  const positionStyle: React.CSSProperties = (() => {
    if (layout === "mobile") {
      // CRITICAL: mobile uses CSS grid positioning — don't apply top/left inline.
      // Return empty object so CSS `position: static` works without !important.
      return {};
    }
    if (layout === "desktop" && isEscaped) {
      // Loop-4 (Task 12 §7.4): t6 escape refined to bottom: -30px (was -60px)
      // — hero now covers full viewport so -30px is enough to read as escape
      // without hitting footer (z=20). left aligned with positionDesktop
      // (73.7%) so horizontal offset matches the on-grid position.
      return { top: "auto", bottom: "-30px", left: "73.7%" };
    }
    // desktop, desktop-narrow (escaped t6 returns inside in narrow).
    return {
      top: thought.positionDesktop.top,
      left: thought.positionDesktop.left,
    };
  })();

  // CSS vars on the chip:
  //  - `--rot`: static rotation (drives drift `transform: rotate(var(--rot))`).
  //  - `--mx` / `--my`: magnetic-pull offset (initially 0, written by the
  //    mousemove effect via direct DOM manipulation). Worker B's CSS reads
  //    them via `translate: var(--mx, 0px) var(--my, 0px);` — we set the
  //    inline defaults here so the property is present from the very first
  //    paint (no FOUC where the chip is shifted before the first mousemove).
  const chipStyle: React.CSSProperties = {
    "--rot": `${rotation}deg`,
    "--fish-scale": "1",
    "--fish-blur": "0px",
    "--fish-opacity": "0.88",
    ...positionStyle,
  } as React.CSSProperties & { "--rot": string; "--fish-scale": string; "--fish-blur": string; "--fish-opacity": string };

  const isExpanded =
    state === "refined" || state === "trace" || state === "aborting";
  const ariaLabel = `فکر خام: ${raw} — با فعال‌سازی، نسخه‌ی پخته را ببینید`;

  // Screen-reader announcement text. Empty when not refined so live-region
  // changes only fire on the raw→refined transition (and back).
  const announcement =
    state === "refined" || state === "trace"
      ? `فکر «${raw}» به نسخه‌ی پخته تبدیل شد: ${refined}`
      : "";

  return (
    <button
      ref={(el) => {
        buttonRef.current = el;
        onRegister?.(el);
      }}
      type="button"
      className={styles.thoughtChip}
      data-id={id}
      data-mode={mode}
      data-state={state}
      data-danger={usesDanger || undefined}
      data-layout={layout}
      data-entered={entered ? "true" : "false"}
      data-scroll-revealed={scrollRevealed ? "true" : "false"}
      style={chipStyle}
      aria-label={ariaLabel}
      aria-expanded={isExpanded}
      onMouseEnter={handleActivate}
      onFocus={handleActivate}
      onMouseLeave={handleLeave}
      onBlur={handleLeave}
      onClick={handleToggle}
    >
      {/* Loop-8 (animation 6): ink spread — a dot that expands into a
          short line right before the type-write begins. Worker B's CSS
          animates this via `.inkSpread` (scaleX 0 → 30 over ~300ms).
          We only provide the DOM node — Worker B owns the visual. */}
      <span className={styles.inkSpread} aria-hidden="true" />

      <span className={styles.thoughtRaw}>{raw}</span>
      <span
        className={styles.thoughtRefined}
        aria-hidden={state === "raw" || state === "resetting" || state === "aborting"}
      >
        <span className={styles.typedText}>{typed}</span>
        <span className={styles.caret} aria-hidden="true" />
      </span>
      <span className={styles.thoughtLabel}>{label}</span>
      <span className={styles.thoughtTimestamp}>{timestamp}</span>
      <span className={styles.traceDot} aria-hidden="true" />

      {/* Always-present refined text for SEO + screen readers (FIX-2).
          The visible .thoughtRefined span only fills in once the typewriter
          has run, so SSR / pre-activation / Googlebot would otherwise see an
          empty chip. This static sr-only span guarantees the full refined
          text is always in the chip's DOM — independent of typewriter state. */}
      <span style={srOnlyStyle}>{refined}</span>

      {/* sr-only live region for screen readers (Tailwind sr-only utility). */}
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </button>
  );
}
