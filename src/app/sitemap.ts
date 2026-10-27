import { publicPath } from "@/lib/public-path";
import type { MetadataRoute } from "next";
import { isSiteReadyForIndexing, siteConfig, worlds } from "@/data/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isSiteReadyForIndexing) return [];

  return worlds.map((world) => ({
    url: new URL(publicPath(world.href), siteConfig.url).toString(),
    lastModified: new Date("2026-08-29"),
    changeFrequency: world.key === "home" ? "weekly" : "monthly",
    priority: world.key === "home" ? 1 : world.key === "projects" || world.key === "resume" ? 0.9 : 0.75,
  }));
}
