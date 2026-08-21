import Link from "next/link";

export default function ProjectsNotFound() {
  return (
    <main
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "6rem 1.5rem",
        textAlign: "center",
        color: "var(--fg)",
      }}
    >
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--step--2)", color: "var(--muted-2)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
        404 — Spec not found
      </p>
      <h1 style={{ fontSize: "var(--step-4)", marginTop: "1rem" }}>این نمونه وجود ندارد.</h1>
      <Link href="/#projects" style={{ display: "inline-flex", marginTop: "2rem", color: "var(--accent-bright)", textDecoration: "none", fontSize: "var(--step--1)" }}>
        بازگشت به آزمایشگاه →
      </Link>
    </main>
  );
}
