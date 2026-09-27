import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://sitwithme.in";
const TITLE = "SIT WITH ME — Someone to talk to, in Bangalore";
const DESCRIPTION =
  "Coffee, walks, movies, temple visits, runs, gym sessions — real, platonic company in Bangalore. No judgment, no dating. Book online, pay securely, meet the same week.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "companionship Bangalore",
    "platonic companion",
    "someone to talk to",
    "running partner Bangalore",
    "workout partner Bangalore",
    "coffee date companion",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "SIT WITH ME",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FBF7F1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
