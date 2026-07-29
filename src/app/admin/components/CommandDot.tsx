// Pure presentational — no "use client" needed.
// Reused in LoginCard header + Dashboard header for the "commandDot pulse"
// visual signature (same as Hero).
import styles from "./CommandDot.module.css";

type CommandDotSize = "sm" | "md";
type CommandDotState = "idle" | "active" | "error";

interface CommandDotProps {
  size?: CommandDotSize;
  state?: CommandDotState;
  className?: string;
}

const SIZE_CLASS: Record<CommandDotSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
};

const STATE_CLASS: Record<CommandDotState, string> = {
  idle: styles.stateIdle,
  active: styles.stateActive,
  error: styles.stateError,
};

export function CommandDot({
  size = "sm",
  state = "idle",
  className,
}: CommandDotProps) {
  const classes = [styles.dot, SIZE_CLASS[size], STATE_CLASS[state], className]
    .filter(Boolean)
    .join(" ");
  return <span className={classes} aria-hidden="true" />;
}

export default CommandDot;
