import type { MetadataRoute } from "next";
import { provinces } from "@/lib/province-directory";

const baseUrl = "https://canadapulse.vercel.app";

const coreRoutes: Array<{ path: string; frequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "", frequency: "daily", priority: 1 },
  { path: "/releases", frequency: "daily", priority: 0.95 },
  { path: "/weekly-pulse", frequency: "weekly", priority: 0.9 },
  { path: "/canada", frequency: "weekly", priority: 0.9 },
  { path: "/housing", frequency: "weekly", priority: 0.9 },
  { path: "/population", frequency: "weekly", priority: 0.9 },
  { path: "/youth", frequency: "weekly", priority: 0.9 },
  { path: "/compare", frequency: "weekly", priority: 0.85 },
  { path: "/tax-dollar", frequency: "monthly", priority: 0.85 },
  { path: "/government", frequency: "monthly", priority: 0.8 },
  { path: "/trade", frequency: "monthly", priority: 0.8 },
  { path: "/energy", frequency: "monthly", priority: 0.8 },
  { path: "/health", frequency: "monthly", priority: 0.75 },
  { path: "/quality-of-life", frequency: "monthly", priority: 0.7 },
  { path: "/data-status", frequency: "daily", priority: 0.65 },
  { path: "/methodology", frequency: "monthly", priority: 0.55 },
];

const provinceSuffixes = ["", "/housing", "/government", "/trade", "/energy", "/health"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const core = coreRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.frequency,
    priority: route.priority,
  }));
  const provincial = provinces.flatMap((province) => [
    ...provinceSuffixes.map((suffix) => ({
      url: `${baseUrl}/province/${province.slug}${suffix}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: suffix ? 0.62 : 0.78,
    })),
    {
      url: `${baseUrl}/population/${province.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.62,
    },
  ]);

  return [...core, ...provincial];
}
