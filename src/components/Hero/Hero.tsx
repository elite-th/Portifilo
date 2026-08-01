"use client";

import dynamic from "next/dynamic";
import styles from "./Hero.module.css";

// Dynamic import for ThoughtCluster - heavy interactive component with animations,
// resonance beams, scroll reveal, and complex state management
const ThoughtCluster = dynamic(() => import("./ThoughtCluster").then((mod) => mod.default), {
  ssr: false,
  loading: () => <div className={styles.scatterOverlay} aria-hidden="true" />,
});

/* JSON-LD: حداقل لازم برای SEO بدون bloat */
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "طاها حسینی",
  url: "https://taha-hosseini.dev",
  description: "شانزده ساله از تهران — روزها هگل و فوکو می‌خونم، شب‌ها کد می‌زنم.",
};

export default function Hero() {
  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <header className={styles.header}>
        <a href="#top" className={styles.brand} aria-label="طاها حسینی">
          <span className={styles.brandDot} aria-hidden="true" />
          طاها حسینی
        </a>
        <nav className={styles.nav} aria-label="ناوبری اصلی">
          <a href="#lab" className={styles.navLink}>
            آزمایشگاه
          </a>
          <a href="#notes" className={styles.navLink}>
            یادداشت‌ها
          </a>
          <a href="#path" className={styles.navLink}>
            مسیر فکری
          </a>
        </nav>
      </header>

      <main className={styles.hero} id="top">
        {/* Scatter field overlay — absolute, covers whole hero.
            Placed BEFORE textBlock so paint order puts it behind.
            CRITICAL: scatterOverlay has NO z-index and pointer-events: none. */}
        <div className={styles.scatterOverlay}>
          <ThoughtCluster />
        </div>

        {/* Text block — centered, z-index 10, above background chips
            (z=2/3 raw/trace). Active chips (z=50) pop above this. */}
        <div className={styles.textBlock}>

          <h1 className={styles.headline}>
            می‌سازمش،
            <br />
            چون می‌بینمش.
          </h1>

          <p className={styles.description}>
            روزها هگل و فوکو می‌خونم، شب‌ها کد می‌زنم. این‌جا جایی‌ست که
            <br />
            سوال‌های فلسفی تبدیل می‌شن به ساختار — و ساختارها حل می‌کنن مسئله‌های واقعی رو.
          </p>

          <div className={styles.actions}>
            <a
              href="#projects"
              className={styles.ctaPrimary}
            >
              برو سراغِ ساخته‌ها
              <span className={styles.ctaArrow} aria-hidden="true">
                ←
              </span>
            </a>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} طاها حسینی</span>
      </footer>
    </div>
  );
}
