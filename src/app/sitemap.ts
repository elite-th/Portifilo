import { MetadataRoute } from "next";
import { PROJECTS } from "@/lib/projectsData";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://taha-hosseini.dev";
  const now = new Date();

  // Static + projects (always available — no DB needed)
  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/#whoami`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/#projects`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/#archive`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ];

  const projectEntries: MetadataRoute.Sitemap = PROJECTS.map((p) => ({
    url: `${base}/projects/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Try to add archive entries from DB — fails gracefully in build without DB
  let entryEntries: MetadataRoute.Sitemap = [];
  try {
    const { db } = await import("@/lib/db");
    const rows = await db.entry.findMany({
      where: { isPublished: true },
      select: { id: true, updatedAt: true },
      take: 100,
    });
    entryEntries = rows.map((r: { id: string; updatedAt: Date }) => ({
      url: `${base}/api/entries/${r.id}`,
      lastModified: r.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  } catch {
    // DB not available at build (e.g., CI without prisma generate) — skip
  }

  return [...staticEntries, ...projectEntries, ...entryEntries];
}
