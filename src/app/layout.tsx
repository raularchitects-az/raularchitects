import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { getLocale } from "next-intl/server";
import { PRODUCTION_SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(PRODUCTION_SITE_URL),
  icons: {
    icon: [{ url: "/brand/favicon.png", type: "image/png" }],
    shortcut: "/brand/favicon.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "only light",
  themeColor: "#f7f2ec",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
      </head>
      <body className="min-h-full bg-cream font-sans font-normal text-charcoal">{children}</body>
    </html>
  );
}
