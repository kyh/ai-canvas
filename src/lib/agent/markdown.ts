import { siteConfig } from "@/lib/config";

import {
  agentEndpoints,
  siteIntroParagraphs,
  sitePageLinks,
  siteSummary,
  siteUsageParagraphs,
  whenToUse,
} from "./site-overview";

import type { ProseBlock, ProseListItem, ProsePage } from "./site-pages";

/**
 * Markdown representations of the site, served from the same URLs as the HTML
 * via `Accept: text/markdown` (see `src/proxy.ts`).
 */

export const absoluteUrl = (path: string): string =>
  path.startsWith("http") || path.startsWith("mailto:") ? path : `${siteConfig.url}${path}`;

const renderListItem = (item: ProseListItem): string => {
  const label = item.href ? `[${item.label}](${absoluteUrl(item.href)})` : `**${item.label}**`;
  return item.text ? `- ${label}: ${item.text}` : `- ${label}`;
};

export const renderList = (items: ProseListItem[]): string => items.map(renderListItem).join("\n");

const renderBlock = (block: ProseBlock): string => {
  if (block.kind === "heading") {
    return `## ${block.text}`;
  }
  if (block.kind === "list") {
    return renderList(block.items);
  }
  return block.text;
};

const withTrailingNewline = (body: string): string => `${body.trimEnd()}\n`;

const footer = `[${siteConfig.name}](${siteConfig.url}) · [All pages](${absoluteUrl("/sitemap.xml")}) · [llms.txt](${absoluteUrl("/llms.txt")})`;

export const renderProsePageMarkdown = (page: ProsePage): string =>
  withTrailingNewline(
    [
      `# ${page.heading}`,
      "",
      `> ${page.description}`,
      "",
      ...page.blocks.flatMap((block) => [renderBlock(block), ""]),
      "---",
      "",
      footer,
    ].join("\n"),
  );

export const renderHomeMarkdown = (): string =>
  withTrailingNewline(
    [
      `# ${siteConfig.name} — AI design canvas template`,
      "",
      `> ${siteSummary}`,
      "",
      ...siteIntroParagraphs.flatMap((paragraph) => [paragraph, ""]),
      "## When to use this",
      "",
      renderList(whenToUse),
      "",
      "## How to use it",
      "",
      ...siteUsageParagraphs.flatMap((paragraph) => [paragraph, ""]),
      "## Machine-readable endpoints",
      "",
      renderList(agentEndpoints),
      "",
      "## Pages",
      "",
      renderList(sitePageLinks),
    ].join("\n"),
  );

/** Shared with the HTML not-found page, so a person and an agent get the same places to look next. */
export const notFoundRecoveryLinks: ProseListItem[] = [
  { href: "/", label: "Home", text: "the live AI canvas editor" },
  { href: "/llms.txt", label: "/llms.txt", text: "site overview for language models" },
  { href: "/sitemap.xml", label: "/sitemap.xml", text: "every indexable URL" },
  { href: "/about", label: "About", text: "what this site is" },
  { href: "/contact", label: "Contact", text: "how to reach a human" },
];

export const renderNotFoundMarkdown = (pathname: string): string =>
  withTrailingNewline(
    [
      "# 404 — Page not found",
      "",
      `> \`${pathname}\` does not exist on ${siteConfig.url}.`,
      "",
      "Try one of these instead:",
      "",
      renderList(notFoundRecoveryLinks),
    ].join("\n"),
  );
