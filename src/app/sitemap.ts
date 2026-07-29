import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://taha-hosseini.dev";

  // Static routes
  const staticRoutes = [
    "",
    "/admin",
    "/archive",
    "/api/entries",
  ];

  // Dynamic routes - in production these would be fetched from the database
  // For now we include static archive route and the entries API
  // TODO: Fetch dynamic entry routes from database when available
  const dynamicRoutes = [
    // Archive entries would be fetched dynamically
    // Example: "/archive/entry-1", "/archive/entry-2", etc.
  ];

  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : route.startsWith("/api") ? "never" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/api") ? 0.3 : 0.7,
  }));
}