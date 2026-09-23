import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { bio } from "@/lib/content";
import "./globals.css";

// Inter for readable body copy, JetBrains Mono for headings, labels and code.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL in Dokploy so OG/Twitter image URLs are absolute.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: `${bio.name} · ${bio.tagline}`,
    template: `%s · ${bio.name}`,
  },
  description: bio.shortBio,
  openGraph: {
    title: `${bio.name} · ${bio.tagline}`,
    description: bio.shortBio,
    type: "website",
  },
  twitter: { card: "summary_large_image", creator: bio.handle },
};

export const viewport: Viewport = {
  themeColor: "#0A0E14",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        {/* Fixed dot-grid texture behind everything */}
        <div aria-hidden className="bg-dot-grid" />

        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-accent px-3 py-2 font-mono text-sm text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>

        <Navbar />
        <main id="main" className="relative z-10 flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
