import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://sitwithme.in";
  const paths = ["", "/terms", "/privacy", "/refund-policy", "/service-delivery", "/contact"];
  return paths.map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
  }));
}
