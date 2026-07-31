"use client";

import { useCallback } from "react";
import dynamic from "next/dynamic";
import styles from "./Hero.module.css";

// Dynamic import for ThoughtCluster - heavy interactive component with animations,
// resonance beams, scroll reveal, and complex state management
const ThoughtCluster = dynamic(() => import("./ThoughtCluster").then((mod) => mod.default), {
  ssr: false,
  loading: () => <div className={styles.scatterOverlay} aria-hidden="true" />,
});

/* =========================================================
 * Hero — "Knowledge Alchemy"
 * --------------------------------
 * Centered layout — text in the geometric heart of the hero,
 * six chips scattered around as a transparent overlay.
 *
 * JSON-LD: Person + WebSite + ProfilePage (comprehensive SEO)
 * ========================================================= */

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://taha-hosseini.dev/#person",
    name: "طاها حسینی",
    jobTitle: "سازنده‌ی Taskino و معمار Mind 2.0",
    url: "https://taha-hosseini.dev",
    sameAs: [
      "https://github.com/taha-hosseini",
      "https://twitter.com/taha_hosseini",
      "https://linkedin.com/in/taha-hosseini",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "تهران",
      addressCountry: "IR",
    },
    knowsAbout: [
      "Taskino",
      "Mind 2.0",
      "Knowledge Alchemy",
      "علوم انسانی",
      "مهندسی نرم‌افزار",
      "یادداشت‌برداری",
      "Offline-First Architecture",
      "Circadian Creativity",
    ],
    description:
      "سنتز علوم انسانی و مهندسی نرم‌افزار. طاها حسینی؛ جست‌وجوگری در قلمرو اندیشه و معمار سیستم‌های دیجیتال. تبدیل ایده‌های انتزاعی به ساختار و پروژه‌های واقعی.",
    potentialAction: {
      "@type": "ViewAction",
      target: "https://taha-hosseini.dev",
      name: "نمایش پورتوفولیو",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://taha-hosseini.dev/#website",
    url: "https://taha-hosseini.dev",
    name: "طاها حسینی — پورتوفولیو",
    description: "سنتز علوم انسانی و مهندسی نرم‌افزار. تبدیل شهودهای انسانی به ساختار و پروژه.",
    publisher: { "@id": "https://taha-hosseini.dev/#person" },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: "https://taha-hosseini.dev/search?q={search_term_string}" },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": "https://taha-hosseini.dev/#profilepage",
    url: "https://taha-hosseini.dev",
    name: "طاها حسینی — پروفایل",
    description: "پروفایل طاها حسینی، دانش‌آموز علوم انسانی و معمار سیستم‌های دیجیتال.",
    mainEntity: { "@id": "https://taha-hosseini.dev/#person" },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "خانه", item: "https://taha-hosseini.dev" },
        { "@type": "ListItem", position: 2, name: "پروفایل", item: "https://taha-hosseini.dev" },
      ],
    },
  },
];

export default function Hero() {
  // Primary CTA now opens the linear journey (§۱ WhoAmI) first, so the
  // reader meets Taha before seeing his work. Planner §1.1 (Task 37).
  const handleEnterLab = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const target = document.getElementById("whoami");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    []
  );

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
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            ۱۶ سال
            <span className={styles.eyebrowSlash} aria-hidden="true">
              /
            </span>
            تهران
            <span className={styles.eyebrowSlash} aria-hidden="true">
              /
            </span>
            ۲:۱۴ صبح
          </span>

          <h1 className={styles.headline}>
            جایی که اندیشه،
            <br />
            <span className={styles.headlineAccent}>کالبد</span> می‌یابد.
          </h1>

          <p className={styles.description}>
            من <strong>طاها</strong> هستم. شانزده سالم است، در تهران بزرگ می‌شوم.
            <br />
            روزها علوم انسانی می‌خوانم، شب‌ها کد می‌زنم.
            <br />
            بین این دو، چیزی می‌سازم که نه کاملاً فلسفه است، نه کاملاً مهندسی —
            <br />
            چیزی شبیه کیمیاگری.
          </p>

          <div className={styles.actions}>
            <a
              href="#whoami"
              className={styles.ctaPrimary}
              onClick={handleEnterLab}
            >
              برو پایین — بیشتر بخون
              <span className={styles.ctaArrow} aria-hidden="true">
                ←
              </span>
            </a>
            <a href="#path" className={styles.ctaSecondary}>
              ببین چی ساختم
              <span className={styles.ctaSecondaryArrow} aria-hidden="true">
                ←
              </span>
            </a>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <span className={styles.footerMeta}>
          <span className={styles.footerPulse} aria-hidden="true" />
          تهران · ۱۶ سال · علوم انسانی
        </span>
        <span>© {new Date().getFullYear()} طاها حسینی</span>
      </footer>
    </div>
  );
}
