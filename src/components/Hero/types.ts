/* =========================================================
 * Hero — Scattered Raw → Refined thoughts
 * Type definitions (shared with Worker B / CSS author)
 * ========================================================= */

/** Transformation variant for a thought chip (see design spec §7). */
export type ThoughtMode = 1 | 2 | 3 | 4;

/** Lifecycle states for a chip. Drives CSS via [data-state]. */
export type ThoughtState =
  | "raw"
  | "refining"
  | "refined"
  | "trace"
  | "resetting"
  | "aborting";

/**
 * Responsive layout mode for the scatter field.
 * - "desktop": width >= 1180 (escaped thought t6 sits in gutter)
 * - "desktop-narrow": 1010 <= width < 1180 (t6 returns inside field)
 * - "mobile": width < 1010 (single column layout, mobile positions)
 */
export type LayoutMode = "desktop" | "mobile" | "desktop-narrow";

/** Position of a chip inside the scatter field, expressed as CSS %. */
export interface ThoughtPosition {
  top: string;
  left: string;
}

/** Full description of a single raw → refined thought. */
export interface Thought {
  /** Stable DOM id ("t1".."t6"). Used as data-id. */
  id: string;
  /** Raw (idle) text — the unprocessed fragment. */
  raw: string;
  /** Refined text — what type-writes in once activated. */
  refined: string;
  /** Brand tag (#taskino, #mind2.0, ...). */
  label: string;
  /** Display timestamp in Persian/Shamsi format. */
  timestamp: string;
  /** Which transformation variant to use. */
  mode: ThoughtMode;
  /** Static rotation in degrees (drift is on top of this). */
  rotation: number;
  /** When true, chip uses --danger accent (only t3). */
  usesDanger?: boolean;
  /** When true, the chip is allowed to escape the field bounds (t6). */
  isEscaped?: boolean;
  /** How long the trace state persists before resetting (ms). */
  traceDuration: number;
  /** Per-chip drift animation duration (ms). Currently advisory; CSS owns the drift. */
  driftDuration: number;
  /** Position on desktop / desktop-narrow layouts. */
  positionDesktop: ThoughtPosition;
  /** Position on mobile layout. */
  positionMobile: ThoughtPosition;
  /**
   * Per-chip entrance choreography delay in ms (Loop-8: animation 1).
   * The cluster reads this to schedule its `data-entered` flip via
   * `setTimeout`. When omitted, the cluster falls back to its hardcoded
   * stagger table (see ThoughtCluster.tsx).
   *
   * Entrance timing is owned by JS (setTimeout-flipped `data-entered`),
   * so no `--stagger-delay` CSS var is required.
   */
  entranceDelay?: number;
}

/**
 * Entrance choreography config (Loop-8: animation 1).
 * The cluster uses this to schedule each chip's `data-entered` flip via
 * `setTimeout`. JS owns the timing — no CSS var is required on the chip.
 */
export interface EntranceConfig {
  /** Delay before this chip's entrance animation starts (ms). */
  staggerDelay: number;
}

/**
 * Magnetic-pull offset in pixels (Loop-8: animation 4).
 * Worker A writes this via direct DOM manipulation (`chip.style.setProperty`)
 * — never React state — to avoid re-renders. Worker B reads it through the
 * `--mx` / `--my` CSS variables on the chip element.
 */
export interface MagneticOffset {
  x: number;
  y: number;
}

/** Props for a single RawThought chip. */
export interface RawThoughtProps {
  thought: Thought;
  layout: LayoutMode;
  /** Whether this chip is currently the cluster's active thought. */
  isActive: boolean;
  /** Cluster tells the chip to deactivate (e.g. another chip took focus). */
  onActivate: () => void;
  onDeactivate: () => void;
  /** User's prefers-reduced-motion setting. */
  reducedMotion: boolean;
  /** Cluster hook: notify parent when this chip enters / leaves the trace state. */
  onTraceChange?: (id: string, isTrace: boolean) => void;
  /** Cluster hook: cluster wants to force-reset this chip (e.g. ↺ button). */
  resetSignal?: number;
  /**
   * Loop-8 (animation 1): whether this chip has finished its entrance
   * choreography. Drives the `data-entered` attribute on the chip button,
   * which Worker B's CSS reads via `[data-entered="true"]`.
   *
   * The cluster flips this per chip after a `setTimeout` (stagger mount),
   * so the entrance timing is fully owned by JS — no `--stagger-delay`
   * CSS var is needed.
   */
  entered: boolean;
  /** Cluster registers/unregisters this chip's DOM node for the shared
   *  eyefish mousemove listener (FIX-8). Called via the button's ref
   *  callback. */
  onRegister?: (el: HTMLButtonElement | null) => void;
  /** Whether the hero has entered the viewport and the chip can crystallize in. */
  scrollRevealed: boolean;
}
