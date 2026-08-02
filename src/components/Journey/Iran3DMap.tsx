"use client";

import styles from "./Iran3DMap.module.css";
import { PROVINCES, type ProvincePath } from "./iranPaths";

/* ============================================================
 * Iran3DMap — نقشه‌ی کامل ایران 3D خوابیده روی میز
 * ------------------------------------------------------------
 * - ۳۱ استان با تمام شهرستان‌ها
 * - استان تهران طلایی، بقیه خاکستری تیره
 * - نشانگر طلایی 3D روی تهران (x≈386, y≈683)
 * - perspective 1200px + rotateX(55deg)
 * viewBox: "30 200 1020 955"
 * ============================================================ */

const TEHRAN_PROVINCE = "Tehran";

function renderPath(p: ProvincePath, key: number) {
  if (p.d) {
    return <path key={key} d={p.d} />;
  }
  if (p.points) {
    return <polygon key={key} points={p.points} />;
  }
  return null;
}

export default function Iran3DMap() {
  const provinceNames = Object.keys(PROVINCES);

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
          <defs>
            <radialGradient id="goldPin" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#f5e6c8" />
              <stop offset="30%" stopColor="#d4af6a" />
              <stop offset="70%" stopColor="#b08d4a" />
              <stop offset="100%" stopColor="#8a6a2e" />
            </radialGradient>
          </defs>

          {/* تمام استان‌ها — خاکستری تیره */}
          <g className={styles.allProvinces}>
            {provinceNames.map((provName) =>
              PROVINCES[provName].map((p, i) =>
                renderPath(p, provinceNames.length * 100 + i)
              )
            )}
          </g>

          {/* استان تهران — طلایی */}
          <g className={styles.tehranProvince}>
            {PROVINCES[TEHRAN_PROVINCE]?.map((p, i) =>
              renderPath(p, i)
            )}
          </g>

          {/* نشانگر طلایی 3D روی تهران */}
          <g className={styles.pinGroup}>
            {/* سایه بیضوی */}
            <ellipse
              cx="392"
              cy="712"
              rx="14"
              ry="6"
              fill="rgba(0,0,0,0.45)"
              className={styles.pinShadow}
            />
            {/* دایره طلایی */}
            <circle
              cx="388"
              cy="685"
              r="9"
              fill="url(#goldPin)"
              className={styles.pin}
            />
            {/* highlight سفید */}
            <ellipse
              cx="385"
              cy="681"
              rx="3.5"
              ry="2.5"
              fill="rgba(255,255,255,0.4)"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
