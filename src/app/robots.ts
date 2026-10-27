import { publicPath } from "@/lib/public-path";
import type { MetadataRoute } from "next";
import { isSiteReadyForIndexing, siteConfig } from "@/data/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: isSiteReadyForIndexing
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: isSiteReadyForIndexing
      ? new URL(publicPath("/sitemap.xml"), siteConfig.url).toString()
      : undefined,
  };
}
