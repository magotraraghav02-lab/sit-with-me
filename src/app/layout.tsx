import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIT WITH ME — Someone to talk to, in Bangalore",
  description:
    "Coffee, walks, movies, temple visits — real, platonic company in Bangalore. No judgment, no dating.",
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
