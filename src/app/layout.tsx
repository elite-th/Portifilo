import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { Crimson_Pro } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui"],
});

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson-pro",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400", "600", "700"],
  fallback: ["Georgia", "serif"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500"],
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://taha-hosseini.dev"),
  title: {
    default: "طاها حسینی — جایی که اندیشه، کالبد می‌یابد",
    template: "%s | طاها حسینی",
  },
  description: "سنتز علوم انسانی و مهندسی نرم‌افزار. طاها حسینی؛ جست‌وجوگری در قلمرو اندیشه و معمار سیستم‌های دیجیتال. تبدیل ایده‌های انتزاعی به ساختار و پروژه‌های واقعی.",
  keywords: [
    "طاها حسینی",
    "Taskino",
    "Mind 2.0",
    "علوم انسانی",
    "مهندسی نرم‌افزار",
    "Knowledge Alchemy",
  ],
  authors: [{ name: "طاها حسینی", url: "https://taha-hosseini.dev" }],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://taha-hosseini.dev",
    siteName: "طاها حسینی",
    title: "طاها حسینی — جایی که اندیشه، کالبد می‌یابد",
    description: "سنتز علوم انسانی و مهندسی نرم‌افزار. تبدیل شهودهای انسانی به ساختار و پروژه.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "طاها حسینی - Portfolio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "طاها حسینی — جایی که اندیشه، کالبد می‌یابد",
    description: "سنتز علوم انسانی و مهندسی نرم‌افزار.",
    images: ["/og-image.png"],
    creator: "@taha_hosseini",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
    other: [{ rel: "icon", type: "image/png", sizes: "32x32", url: "/favicon-32x32.png" }],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://taha-hosseini.dev",
    languages: { "fa": "https://taha-hosseini.dev", "x-default": "https://taha-hosseini.dev" },
  },
  robots: { index: true, follow: true },
  verification: { google: "your-verification-code" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F0E8" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B0C" },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="dark" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} ${crimsonPro.variable} ${jetbrainsMono.variable} antialiased`}
        style={{ fontFamily: "var(--font-vazirmatn), system-ui, sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
