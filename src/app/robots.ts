import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"],
    },
    sitemap: "https://taha-hosseini.dev/sitemap.xml",
    host: "https://taha-hosseini.dev",
  };
}