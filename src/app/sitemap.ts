import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/config";

const sitemap = (): MetadataRoute.Sitemap => {
  const routes = siteConfig.routes.map((route) => ({
    lastModified: new Date().toISOString(),
    url: `${siteConfig.url}${route}`,
  }));

  return [...routes];
};

export default sitemap;
