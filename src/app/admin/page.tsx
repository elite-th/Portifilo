"use client";

import { useCallback, useEffect, useState } from "react";
import { LoginCard } from "./LoginCard";
import { Dashboard } from "./Dashboard";
import styles from "./admin.module.css";

type View = "loading" | "login" | "dashboard";

export default function AdminPage() {
  const [view, setView] = useState<View>("loading");
  const [username, setUsername] = useState("");

  // Check existing session on mount
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/check", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.authenticated) {
          setUsername(data.username);
          setView("dashboard");
        } else {
          setView("login");
        }
      })
      .catch(() => {
        if (!cancelled) setView("login");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setUsername("");
    setView("login");
  }, []);

  const handleLoginSuccess = useCallback((u: string) => {
    setUsername(u);
    setView("dashboard");
  }, []);

  return (
    <div className={styles.page} data-view={view}>
      {view === "loading" ? <LoadingScreen /> : null}
      {view === "login" ? (
        <LoginCard onSuccess={handleLoginSuccess} />
      ) : null}
      {view === "dashboard" ? (
        <Dashboard username={username} onLogout={handleLogout} />
      ) : null}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span className={styles.loadingDot} aria-hidden="true" />
      <span className={styles.loadingDot} aria-hidden="true" />
      <span className={styles.loadingDot} aria-hidden="true" />
      <span className={styles.loadingText}>در حال بررسی نشست…</span>
    </div>
  );
}
