"use client";

import styles from "./Iran3DMap.module.css";
import { PROVINCES, type ProvincePath } from "./iranPaths";

const TEHRAN_PROVINCE = "Tehran";

function renderPath(p: ProvincePath, key: number) {
  if (p.d) return <path key={key} d={p.d} />;
  if (p.points) return <polygon key={key} points={p.points} />;
  return null;
}

export default function Iran3DMap() {
  const otherProvinces = Object.keys(PROVINCES).filter(
    (name) => name !== TEHRAN_PROVINCE
  );
  const tehranPaths = PROVINCES[TEHRAN_PROVINCE] ?? [];

  return (
    <div className={styles.scene}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="10 30 1340 1760"
        className={styles.mapSvg}
        aria-hidden="true"
      >
        {/* نقشه‌ی کامل ایران — تمام استان‌ها */}
        <g className={styles.iran}>
          {otherProvinces.map((provName, pi) =>
            PROVINCES[provName].map((p, i) =>
              renderPath(p, pi * 100 + i)
            )
          )}
        </g>

        {/* تهران — بولد */}
        <g className={styles.tehran}>
          {tehranPaths.map((p, i) => renderPath(p, i))}
        </g>

        {/* نشانگر */}
        <g className={styles.pinGroup}>
          <ellipse cx="392" cy="712" rx="16" ry="7" fill="rgba(0,0,0,0.5)" className={styles.pinShadow} />
          <circle cx="388" cy="685" r="10" fill="#d4af6a" className={styles.pin} />
          <ellipse cx="385" cy="681" rx="4" ry="3" fill="rgba(255,255,255,0.5)" />
        </g>
      </svg>
    </div>
  );
}
