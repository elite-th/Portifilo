import { forwardRef } from "react";
import styles from "./GlowInput.module.css";

// ─── GlowInput (single-line) ─────────────────────────────────────────
interface GlowInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const GlowInput = forwardRef<HTMLInputElement, GlowInputProps>(
  function GlowInput({ label, hint, error, icon, id, className, ...rest }, ref) {
    const fieldId =
      id ?? `glow-input-${label.replace(/[^a-zA-Z0-9\u0600-\u06FF]+/g, "-").toLowerCase()}`;
    const inputClasses = [styles.input, icon ? styles.inputWithIcon : "", className]
      .filter(Boolean)
      .join(" ");
    return (
      <div className={styles.field} data-state={error ? "error" : "idle"}>
        <label htmlFor={fieldId} className={styles.label}>
          {label}
        </label>
        <div className={styles.control}>
          {icon ? <span className={styles.icon}>{icon}</span> : null}
          <input
            ref={ref}
            id={fieldId}
            className={inputClasses}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={
              error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
            }
            {...rest}
          />
        </div>
        {hint && !error ? (
          <span id={`${fieldId}-hint`} className={styles.hint}>
            {hint}
          </span>
        ) : null}
        {error ? (
          <span id={`${fieldId}-error`} className={styles.errorText} role="alert">
            {error}
          </span>
        ) : null}
      </div>
    );
  },
);

// ─── GlowTextarea (multi-line) ───────────────────────────────────────
interface GlowTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const GlowTextarea = forwardRef<HTMLTextAreaElement, GlowTextareaProps>(
  function GlowTextarea({ label, hint, error, id, className, ...rest }, ref) {
    const fieldId =
      id ??
      `glow-textarea-${label.replace(/[^a-zA-Z0-9\u0600-\u06FF]+/g, "-").toLowerCase()}`;
    const classes = [styles.textarea, className].filter(Boolean).join(" ");
    return (
      <div className={styles.field} data-state={error ? "error" : "idle"}>
        <label htmlFor={fieldId} className={styles.label}>
          {label}
        </label>
        <textarea
          ref={ref}
          id={fieldId}
          className={classes}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
          }
          {...rest}
        />
        {hint && !error ? (
          <span id={`${fieldId}-hint`} className={styles.hint}>
            {hint}
          </span>
        ) : null}
        {error ? (
          <span id={`${fieldId}-error`} className={styles.errorText} role="alert">
            {error}
          </span>
        ) : null}
      </div>
    );
  },
);

export default GlowInput;
