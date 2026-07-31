"use client";

import styles from "./Journey.module.css";
import WhoAmI from "./WhoAmI";
import WhatIBuild from "./WhatIBuild";
import WhereIFrom from "./WhereIFrom";
import WhereIGo from "./WhereIGo";
import Connect from "./Connect";

/* =========================================================
 * Journey — مسیر آشنایی با طاها
 * ---------------------------------------------------------
 * Five-section narrative inserted between <Hero /> and
 * <Synthesis />. Each section is a step in the alchemy
 * metaphor (calcination → coagulation) with its own accent.
 *
 * Order:
 *   1. WhoAmI   (کی هستم)   — accent gold
 *   2. WhatIBuild (چی می‌سازم) — accent cream
 *   3. WhereIFrom (از کجا میام) — accent olive
 *   4. WhereIGo (کجا میرم) — accent bright gold
 *   5. Connect  (بیا وصل بشیم) — gold→olive gradient
 *
 * Each subsection owns its own scroll-reveal + CSS module.
 * This container only owns vertical rhythm + horizontal
 * padding + the sticky background light-line.
 * ========================================================= */

export default function Journey() {
  return (
    <div className={styles.journey} data-journey-root aria-label="مسیر آشنایی">
      {/* Ambient light-line that flows behind all sections. */}
      <div className={styles.ambient} aria-hidden="true">
        <div className={styles.ambientLine} />
        <div className={styles.ambientGlow} />
      </div>

      <WhoAmI />
      <WhatIBuild />
      <WhereIFrom />
      <WhereIGo />
      <Connect />
    </div>
  );
}
