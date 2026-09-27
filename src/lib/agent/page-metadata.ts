import { siteConfig } from "@/lib/config";

import type { Metadata } from "next";

import type { ProsePage } from "./site-pages";

const ogImage = { height: 1080, url: `${siteConfig.url}/og.jpg`, width: 1920 };

export const canonicalAlternates = (path: string): Metadata["alternates"] => ({
  canonical: path,
  types: { "text/markdown": path === "/" ? "/index.md" : `${path}.md` },
});

/**
 * Next merges metadata shallowly: a page's `openGraph` REPLACES the layout's,
 * dropping `og:type` and `og:image`, so this restates them in full.
 */
export const prosePageMetadata = (page: ProsePage): Metadata => ({
  alternates: canonicalAlternates(page.path),
  description: page.description,
  openGraph: {
    description: page.description,
    images: [ogImage],
    locale: "en-US",
    siteName: siteConfig.name,
    title: page.title,
    type: "website",
    url: page.path,
  },
  title: page.title,
});
