"use client";

import dynamic from "next/dynamic";
import styles from "@/app/page.module.css";

// Dynamic import for Archive - heavy component with masonry, modals, and data fetching
const Archive = dynamic(
  () => import("@/components/Archive/Archive").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <section id="archive" className={styles.archiveLoading} aria-label="آرشیو در حال بارگذاری">
        <div className={styles.loadingSpinner} aria-hidden="true" />
      </section>
    ),
  }
);

export default function ArchiveClient() {
  return <Archive />;
}