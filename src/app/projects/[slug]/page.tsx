import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getAllProjectSlugs, PROJECTS } from "@/lib/projectsData";

export function generateStaticParams(): { slug: string }[] {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  const url = `https://taha-hosseini.dev/projects/${slug}`;
  return {
    title: `${project.project} — آزمایشگاه طاها حسینی`,
    description: project.summary,
    alternates: { canonical: url },
    openGraph: {
      title: `${project.project} — طاها حسینی`,
      description: project.summary,
      url,
      type: "article",
      tags: project.tags,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const idx = PROJECTS.findIndex((p) => p.slug === slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.project,
    description: project.summary,
    url: `https://taha-hosseini.dev/projects/${slug}`,
    author: { "@id": "https://taha-hosseini.dev/#person" },
    keywords: project.tags.join(", "),
    inLanguage: "fa-IR",
    position: idx + 1,
  };

  return (
    <main
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "clamp(2rem,6vw,4rem) 1.5rem 4rem",
        color: "var(--fg)",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/#projects"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "var(--muted)",
          textDecoration: "none",
          fontSize: "var(--step--1)",
          marginBottom: "2rem",
          viewTransitionName: "back-link" as unknown as string,
        }}
      >
        → بازگشت به آزمایشگاه
      </Link>

      <header style={{ marginBottom: "2rem" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--step--2)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--muted-2)",
          }}
        >
          SPEC-{(idx + 1).toString().padStart(2, "0")} · آزمایشگاه
        </span>
        <h1
          style={{
            fontFamily: "var(--font-display, var(--font-vazirmatn))",
            fontSize: "var(--step-5)",
            fontWeight: 700,
            lineHeight: 1.15,
            margin: "0.6rem 0 0",
            textWrap: "balance",
            viewTransitionName: `project-title-${slug}` as unknown as string,
          }}
        >
          {project.project}
        </h1>
        <p
          style={{
            marginTop: "1rem",
            fontSize: "var(--step-1)",
            lineHeight: 1.7,
            color: "var(--muted)",
          }}
        >
          {project.summary}
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gap: "1.5rem",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-lg)",
          padding: "1.75rem",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--step--2)",
              letterSpacing: "0.1em",
              color: "var(--accent-bright)",
              textTransform: "uppercase",
            }}
          >
            فرضیه — root thought
          </span>
          <p style={{ margin: "0.5rem 0 0", fontSize: "var(--step-0)", lineHeight: 1.8 }}>
            {project.rootThought}
          </p>
        </div>
        <div
          aria-hidden="true"
          style={{
            height: "1px",
            background: "linear-gradient(90deg, var(--accent) 0%, transparent 100%)",
            opacity: 0.4,
          }}
        />
        <div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--step--2)",
              letterSpacing: "0.1em",
              color: "var(--highlight)",
              textTransform: "uppercase",
            }}
          >
            مشاهده — built structure
          </span>
          <p style={{ margin: "0.5rem 0 0", fontSize: "var(--step-0)", lineHeight: 1.8 }}>
            {project.builtStructure}
          </p>
        </div>
      </section>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginTop: "1.5rem",
        }}
      >
        {project.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--step--2)",
              padding: "0.35rem 0.75rem",
              borderRadius: "999px",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              color: "var(--muted)",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </main>
  );
}
