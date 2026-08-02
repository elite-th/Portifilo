"use client";

import styles from "./Iran3DMap.module.css";
import { IRAN_OUTLINE } from "./iranPaths";

/* ============================================================
 * Iran3DMap — نقشه ایران 3D روی میز
 * ------------------------------------------------------------
 * - مرز کامل ایران در پس‌زمینه
 * - مرز استان تهران مشخص شده (fill طلایی)
 * - نقطه طلایی 3D روی تهران
 * viewBox: "30 200 1020 955" | تهران: x≈386, y≈683
 * ============================================================ */

/* مرز استان تهران — از react-iran-provinces-map */
const TEHRAN_PATH =
  "M386.1,683.1l-5.5-5.1l5.5,5.9l3.8-2l3.8-2.6l6.9-3l3.6-2.2l3.2-2.4l3.8-3.6l4.5,1.2l2.8-1.6l3.8-1l0.4-3.2l-2-4.9v-8.5l0.4-3.2l4.9-0.8h4.4l5.5-2.6h7.5l4.5,1.2l0.2,6.7l2.4-0.6l4.2-1.2l4.4,1.2l5.7,4.5l2.6,0.8l3,1l-6.1-4.9l-1.6-4.4l-0.8-4l7.3-1.8l0.8-1.8l16.4,3.6l13.1,3l6.5-1.2l-0.2-3.6v-4l1.6-2.2l1.4-0.4l11.9,1.2l9.5,2.6l2.8,2l2.2-14l-3-4.5c0,0-1.6-3.8-2.2-3.8c-0.6,0-3.8-3.8-3.8-3.8l0.2-2.8l1.4-4.7l-0.6-3.6l-0.8-1.2l-1.8-0.8l2.4-2l1-3l-0.2-2.6l0.2-2.2l1.8-3.2l-1-2.4l-3.8,1l-3.8-2.4l-4-0.6l-3.8,1.4l-1.4,0.8l-11.3-3.2l-5.5,1.6l-6.5,4.7l-4.7-1.8l-0.6-1.8l-3.8,4.5l-14-2l-3.8-2.6l-4.4-0.4l-6.3-1l-5.1-1.4l-4.7,1.2l-4.2,1.8c0,0-2-0.4-2.4,0.2c-0.4,0.6-3.8-3-3.8-3l-2.6-0.2h-4.5l-3.8,0.6l-5.1,0.8l-6.7,2.6l-5.3-1.2v-1.4l3.2-2.6l3-1.4l8.3,0.2v-3.8l-10.5-2.2l8.7-36l-6.5-2.6l-15-4.9l-15-9.5l-6.3-1.6l-15.8-4.7l-15.4-3.2l-3.8-1.6l3.4,9.1l6.7,15.4l-1.4,5.7l-23.7,25.5l2.6,9.9l1,4.5v6.5l-2.8,3.6l-3,1.8l-1.6,2.8l-2.8,3l1.8,3.2l8.1,2l9.5,7.9l11.7,2.2l17.2,8.3l0.2,3.4l1.6,2.6l7.7,3.8l5.1,1l10.3,5.7l6.7,3l6.5,5.5l2,2.8l-1.6,5.3l-4.5,3.4l-3.6,2.4l-0.4,2.6l0.6,3.8l0.6,3.8l-15.6,6.1";

export default function Iran3DMap() {
  return (
    <div className={styles.scene}>
      {/* سایه زیر نقشه */}
      <div className={styles.shadow} aria-hidden="true" />

      {/* نقشه */}
      <div className={styles.mapWrapper}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="30 200 1020 955"
          className={styles.mapSvg}
          aria-hidden="true"
        >
          {/* مرز کامل ایران */}
          <path
            d={IRAN_OUTLINE}
            fill="var(--bg-elevated)"
            stroke="var(--line)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* مرز استان تهران */}
          <path
            d={TEHRAN_PATH}
            fill="rgba(212,175,106,0.12)"
            stroke="var(--accent)"
            strokeWidth="1"
            strokeLinejoin="round"
          />

          {/* نقطه طلایی 3D */}
          <g className={styles.pinGroup}>
            <ellipse
              cx="400"
              cy="712"
              rx="14"
              ry="6"
              fill="rgba(0,0,0,0.4)"
              className={styles.pinShadow}
            />
            <defs>
              <radialGradient id="goldPin" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#f5e6c8" />
                <stop offset="30%" stopColor="#d4af6a" />
                <stop offset="70%" stopColor="#b08d4a" />
                <stop offset="100%" stopColor="#8a6a2e" />
              </radialGradient>
            </defs>
            <circle
              cx="395"
              cy="683"
              r="8"
              fill="url(#goldPin)"
              className={styles.pin}
            />
            <ellipse
              cx="392"
              cy="680"
              rx="3"
              ry="2"
              fill="rgba(255,255,255,0.35)"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}