import type { MetadataRoute } from "next";

import { prosePages } from "@/lib/agent/site-pages";
import { siteConfig } from "@/lib/config";

const sitemap = (): MetadataRoute.Sitemap =>
  ["", ...prosePages.map((page) => page.path)].map((route) => ({
    lastModified: new Date().toISOString(),
    url: `${siteConfig.url}${route}`,
  }));

export default sitemap;
