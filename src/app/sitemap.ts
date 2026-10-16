import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";

import { prosePages } from "@/lib/agent/site-pages";
import { siteConfig } from "@/lib/config";

// Cached so the sitemap stays prerendered under cacheComponents, where a bare
// `new Date()` would render it on every request.
// oxlint-disable-next-line require-await -- "use cache" requires an async function
const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  "use cache";
  cacheLife("max");
  return ["", ...prosePages.map((page) => page.path)].map((route) => ({
    lastModified: new Date().toISOString(),
    url: `${siteConfig.url}${route}`,
  }));
};

export default sitemap;
