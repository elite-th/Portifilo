import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "طاها حسینی — جایی که اندیشه، کالبد می‌یابد",
    short_name: "طاها حسینی",
    description: "سنتز علوم انسانی و مهندسی نرم‌افزار.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0B0C",
    theme_color: "#0B0B0C",
    lang: "fa",
    dir: "rtl",
  };
}
