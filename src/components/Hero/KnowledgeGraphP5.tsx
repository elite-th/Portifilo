'use client';

/* =========================================================
   Knowledge Alchemy Constellation — dependency-free fallback
   ---------------------------------------------------------
   The current hero uses ThoughtCluster instead of this legacy P5 canvas.
   Keep this component lightweight so old imports still render a small
   alchemy-path visual without requiring the p5 package.
   ========================================================= */

const STAGES = [
  { id: 0, label: "فکر خام", subtitle: "پراکنده", x: 18, y: 28 },
  { id: 1, label: "یادداشت", subtitle: "منظم‌شده", x: 40, y: 44 },
  { id: 2, label: "الگو", subtitle: "بینش", x: 62, y: 58 },
  { id: 3, label: "پروژه", subtitle: "ساخته‌شده", x: 82, y: 74 },
] as const;

export default function KnowledgeGraphP5() {
  return (
    <figure
      aria-label="مسیر تبدیل فکر خام به پروژه"
      style={{
        position: "relative",
        width: "100%",
        minHeight: 360,
        margin: 0,
        border: "1px solid var(--line)",
        borderRadius: "var(--radius)",
        background:
          "radial-gradient(circle at 22% 24%, var(--accent-soft), transparent 32%), radial-gradient(circle at 78% 78%, var(--highlight-soft), transparent 30%), var(--surface)",
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        role="img"
        aria-hidden="true"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient id="alchemy-path" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--sepia-ink)" stopOpacity="0.45" />
            <stop offset="52%" stopColor="var(--accent)" stopOpacity="0.75" />
            <stop offset="100%" stopColor="var(--highlight)" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <path
          d="M18 28 C30 28 31 44 40 44 S52 56 62 58 S74 68 82 74"
          fill="none"
          stroke="url(#alchemy-path)"
          strokeWidth="0.55"
          strokeDasharray="2 2.6"
        />
        {STAGES.map((stage) => (
          <g key={stage.id}>
            <circle
              cx={stage.x}
              cy={stage.y}
              r={stage.id === 3 ? 3.2 : 2.6}
              fill={stage.id >= 2 ? "var(--highlight)" : "var(--accent)"}
              opacity={0.18 + stage.id * 0.16}
            />
            <circle
              cx={stage.x}
              cy={stage.y}
              r={stage.id === 3 ? 1.35 : 1.1}
              fill={stage.id >= 2 ? "var(--highlight)" : "var(--accent)"}
            />
          </g>
        ))}
      </svg>

      <figcaption
        style={{
          position: "absolute",
          inset: 24,
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 18,
          alignContent: "space-between",
          pointerEvents: "none",
        }}
      >
        {STAGES.map((stage) => (
          <span
            key={stage.id}
            style={{
              justifySelf: stage.id % 2 === 0 ? "start" : "end",
              alignSelf: stage.id < 2 ? "start" : "end",
              color: "var(--fg)",
              fontSize: "var(--step--1)",
              lineHeight: 1.7,
            }}
          >
            <strong style={{ display: "block", color: "var(--accent)" }}>
              {stage.label}
            </strong>
            <small style={{ color: "var(--muted)" }}>{stage.subtitle}</small>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
