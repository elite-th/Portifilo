"use client";

import { useCallback, useRef, useState } from "react";
import { GlowInput, GlowTextarea } from "./components/GlowInput";
import styles from "./EntryForm.module.css";

type EntryType = "TOSHEH" | "ARTICLE" | "POEM";

interface EntryFormProps {
  type: EntryType;
}

const TYPE_LABEL: Record<EntryType, string> = {
  TOSHEH: "توشه‌ی جدید",
  ARTICLE: "مقاله‌ی جدید",
  POEM: "شعر جدید",
};

const TYPE_NAME: Record<EntryType, string> = {
  TOSHEH: "توشه",
  ARTICLE: "مقاله",
  POEM: "شعر",
};

interface FormMessage {
  ok: boolean;
  text: string;
}

export function EntryForm({ type }: EntryFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [mood, setMood] = useState("");
  const [source, setSource] = useState("");
  const [emotion, setEmotion] = useState("");
  const [dedicatedTo, setDedicatedTo] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setTitle("");
    setContent("");
    setExcerpt("");
    setTags("");
    setMood("");
    setSource("");
    setEmotion("");
    setDedicatedTo("");
    setIsPublished(true);
    setMessage(null);
    setTimeout(() => titleRef.current?.focus(), 50);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setMessage(null);

      const body: Record<string, unknown> = {
        type,
        title,
        content,
        isPublished,
      };
      if (excerpt.trim()) body.excerpt = excerpt.trim();
      if (tags.trim()) {
        body.tags = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
      if (type === "TOSHEH") {
        if (mood.trim()) body.mood = mood.trim();
        if (source.trim()) body.source = source.trim();
      }
      if (type === "POEM") {
        if (emotion.trim()) body.emotion = emotion.trim();
        if (dedicatedTo.trim()) body.dedicatedTo = dedicatedTo.trim();
      }

      try {
        const res = await fetch("/api/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage({ ok: false, text: data.error || "خطا در ذخیره" });
          return;
        }
        setMessage({ ok: true, text: `${TYPE_NAME[type]} با موفقیت ذخیره شد` });
        setTimeout(() => reset(), 1300);
      } catch {
        setMessage({ ok: false, text: "خطای شبکه" });
      } finally {
        setSaving(false);
      }
    },
    [
      type,
      title,
      content,
      excerpt,
      tags,
      mood,
      source,
      emotion,
      dedicatedTo,
      isPublished,
      reset,
    ],
  );

  const contentLabel = type === "POEM" ? "متن شعر *" : "محتوا *";

  return (
    <form
      onSubmit={handleSubmit}
      className={styles.form}
      data-type={type}
      data-state={message && !message.ok ? "error" : "idle"}
      noValidate
    >
      <h2 className={styles.title}>{TYPE_LABEL[type]}</h2>

      {/* ─── Section 1: اطلاعات پایه ─── */}
      <section className={styles.section}>
        <h3 className={styles.sectionHeading}>
          <span className={styles.sectionLine} aria-hidden="true" />
          اطلاعات پایه
        </h3>
        <div className={styles.fieldStack}>
          <GlowInput
            ref={titleRef}
            label="عنوان *"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <GlowTextarea
            label={contentLabel}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={type === "POEM" ? 8 : 10}
            required
          />
        </div>
      </section>

      {/* ─── Section 2: متادیتا ─── */}
      <section className={styles.section}>
        <h3 className={styles.sectionHeading}>
          <span className={styles.sectionLine} aria-hidden="true" />
          متادیتا
        </h3>
        <div className={styles.fieldStack}>
          <GlowInput
            label="خلاصه (اختیاری)"
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="برای کارت فهرست"
            hint="یک خط خلاصه که در کارت آرشیو نمایش داده می‌شود."
          />
          <GlowInput
            label="برچسب‌ها (با کاما)"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="taskino, night, mind2.0"
            dir="ltr"
          />

          {type === "TOSHEH" ? (
            <div className={styles.fieldRow}>
              <GlowInput
                label="مود"
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="night, metro, book"
              />
              <GlowInput
                label="منبع"
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="مترو، کتاب، گفتگو"
              />
            </div>
          ) : null}

          {type === "POEM" ? (
            <div className={styles.fieldRow}>
              <GlowInput
                label="احساس"
                type="text"
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                placeholder="سکوت، فقدان، شب"
              />
              <GlowInput
                label="تقدیم به"
                type="text"
                value={dedicatedTo}
                onChange={(e) => setDedicatedTo(e.target.value)}
                placeholder="ساعت‌های کوچک صبح"
              />
            </div>
          ) : null}
        </div>
      </section>

      {/* ─── Section 3: انتشار ─── */}
      <section className={styles.section}>
        <h3 className={styles.sectionHeading}>
          <span className={styles.sectionLine} aria-hidden="true" />
          انتشار
        </h3>
        <label className={styles.checkboxField}>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <span>منتشر شود</span>
        </label>
      </section>

      {message ? (
        <div
          className={message.ok ? styles.successBanner : styles.errorBanner}
          role="status"
          aria-live="polite"
        >
          {message.ok ? (
            <CheckIcon className={styles.checkIcon} />
          ) : (
            <WarnIcon className={styles.warnIcon} />
          )}
          <span>{message.text}</span>
        </div>
      ) : null}

      <button
        type="submit"
        className={styles.submit}
        disabled={saving}
        aria-busy={saving}
      >
        {saving ? <Spinner className={styles.spinner} /> : null}
        <span>{saving ? "در حال ذخیره..." : "ذخیره کن"}</span>
      </button>
    </form>
  );
}

export default EntryForm;

// ─── Inline SVG icons ────────────────────────────────────────────────────────
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="5 13 9 17 19 7" />
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
