import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/data-model"],
    },
    sitemap: "https://canadapulse.vercel.app/sitemap.xml",
    host: "https://canadapulse.vercel.app",
  };
}
