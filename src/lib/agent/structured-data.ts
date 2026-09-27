import { siteConfig } from "@/lib/config";

import { absoluteUrl } from "./markdown";
import { siteSummary } from "./site-overview";

import type { ProsePage } from "./site-pages";

/** `undefined` is allowed because `JSON.stringify` drops it, which is how optional fields are left out. */
export type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };

export interface JsonLdNode {
  [key: string]: JsonLdValue;
}

const ORGANIZATION_ID = `${siteConfig.url}/#organization`;
const WEBSITE_ID = `${siteConfig.url}/#website`;
const APPLICATION_ID = `${siteConfig.url}/#application`;

/**
 * No `address`: this is a personal open-source project with no premises, and
 * inventing a PostalAddress to satisfy a validator would be worse than omitting it.
 */
export const buildOrganization = () =>
  ({
    "@id": ORGANIZATION_ID,
    "@type": "Organization",
    contactPoint: [
      {
        "@type": "ContactPoint",
        availableLanguage: ["en"],
        contactType: "customer support",
        email: siteConfig.email,
        url: absoluteUrl("/contact"),
      },
      {
        "@type": "ContactPoint",
        availableLanguage: ["en"],
        contactType: "technical support",
        email: siteConfig.email,
        url: `${siteConfig.repository}/issues`,
      },
    ],
    description: siteSummary,
    email: siteConfig.email,
    founder: { "@type": "Person", name: siteConfig.author.name, url: siteConfig.author.url },
    logo: {
      "@type": "ImageObject",
      height: 96,
      url: `${siteConfig.url}/favicon/favicon-96x96.png`,
      width: 96,
    },
    name: siteConfig.name,
    sameAs: siteConfig.sameAs,
    url: siteConfig.url,
  }) satisfies JsonLdNode;

export const buildWebSite = () =>
  ({
    "@id": WEBSITE_ID,
    "@type": "WebSite",
    description: siteConfig.description,
    inLanguage: "en-US",
    name: siteConfig.name,
    publisher: { "@id": ORGANIZATION_ID },
    url: siteConfig.url,
  }) satisfies JsonLdNode;

export const buildSoftwareApplication = () =>
  ({
    "@id": APPLICATION_ID,
    "@type": "SoftwareApplication",
    applicationCategory: "DesignApplication",
    description: siteSummary,
    featureList: [
      "Infinite canvas with zoom, pan, multi-select, layers and transforms",
      "Agent-generated text, frame, image and live HTML blocks",
      "Canvas snapshot sent with every prompt for visual context",
      "Bring-your-own Vercel AI Gateway key",
    ],
    image: `${siteConfig.url}/og.jpg`,
    isAccessibleForFree: true,
    license: "https://opensource.org/licenses/MIT",
    name: siteConfig.name,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: "USD",
    },
    operatingSystem: "Any",
    publisher: { "@id": ORGANIZATION_ID },
    sameAs: [siteConfig.repository],
    url: siteConfig.url,
  }) satisfies JsonLdNode;

export const buildHomeGraph = () =>
  ({
    "@context": "https://schema.org",
    "@graph": [buildOrganization(), buildWebSite(), buildSoftwareApplication()],
  }) satisfies JsonLdNode;

export const buildWebPage = (page: ProsePage) =>
  ({
    "@id": `${absoluteUrl(page.path)}#webpage`,
    "@type": "WebPage",
    about: { "@id": ORGANIZATION_ID },
    description: page.description,
    headline: page.heading,
    inLanguage: "en-US",
    isPartOf: { "@id": WEBSITE_ID },
    name: page.title,
    url: absoluteUrl(page.path),
  }) satisfies JsonLdNode;

export const buildProsePageGraph = (page: ProsePage) =>
  ({
    "@context": "https://schema.org",
    "@graph": [buildOrganization(), buildWebPage(page)],
  }) satisfies JsonLdNode;

/** The output lands in a `<script>` body, so `<` is escaped to keep `</script>` from closing it early. */
export const serializeJsonLd = (node: JsonLdNode): string =>
  JSON.stringify(node).replaceAll("<", "\\u003c");
