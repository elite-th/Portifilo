"use client";
import styles from "./LightThread.module.css";

// Static vertical line — a visual thread that binds the journey sections.
// No pulse, no scroll tracking, no nodes. Just a quiet gradient line.
// Mobile (< 768px): hidden via CSS.
export default function LightThread() {
  return (
    <div className={styles.thread} aria-hidden="true">
      <div className={styles.line} />
    </div>
  );
}
