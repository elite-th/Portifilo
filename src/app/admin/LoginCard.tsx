"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CommandDot } from "./components/CommandDot";
import { GlowInput } from "./components/GlowInput";
import styles from "./LoginCard.module.css";

interface LoginCardProps {
  onSuccess: (username: string) => void;
}

export function LoginCard({ onSuccess }: LoginCardProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // bump on each error → re-trigger the shake animation
  const [shakeKey, setShakeKey] = useState(0);

  const usernameRef = useRef<HTMLInputElement>(null);

  // autofocus after entrance animation settles
  useEffect(() => {
    const t = setTimeout(() => usernameRef.current?.focus(), 320);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "خطا در ورود");
          setShakeKey((k) => k + 1);
          return;
        }
        onSuccess(username);
      } catch {
        setError("خطای شبکه");
        setShakeKey((k) => k + 1);
      } finally {
        setLoading(false);
      }
    },
    [username, password, onSuccess],
  );

  return (
    <div className={styles.page}>
      <div className={styles.ambient} aria-hidden="true" />

      <div
        key={shakeKey}
        className={styles.card}
        data-state={error ? "error" : "idle"}
      >
        <header className={styles.header}>
          <CommandDot state={error ? "error" : "active"} />
          <div>
            <h1 className={styles.title}>فرماندهی طاها</h1>
            <p className={styles.subtitle}>مرکز ساخت توشه‌های مغز</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <GlowInput
            ref={usernameRef}
            label="نام کاربری"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            dir="ltr"
            icon={<UserIcon />}
          />

          <GlowInput
            label="رمز عبور"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            dir="ltr"
            icon={<LockIcon />}
          />

          {error ? (
            <div
              className={styles.errorBanner}
              role="alert"
              aria-live="assertive"
            >
              <WarnIcon className={styles.errorIcon} />
              <span>{error}</span>
            </div>
          ) : null}

          <button
            type="submit"
            className={styles.submit}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? <Spinner className={styles.spinner} /> : null}
            <span>{loading ? "در حال ورود..." : "ورود به فرماندهی"}</span>
          </button>
        </form>

        <p className={styles.footer}>
          فقط طاها دسترسی دارد. همه‌ی فعالیت‌ها ثبت می‌شود.
        </p>
      </div>
    </div>
  );
}

export default LoginCard;

// ─── Inline SVG icons (no external deps) ────────────────────────────────────
function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function WarnIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 2 21h20L12 3z" />
      <line x1="12" y1="9" x2="12" y2="14" />
      <circle cx="12" cy="17.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2.5"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
