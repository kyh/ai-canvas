import { siteConfig } from "@/lib/config";

import { renderList } from "./markdown";
import {
  agentEndpoints,
  siteIntroParagraphs,
  sitePageLinks,
  siteSummary,
  siteUsageParagraphs,
  whenToUse,
} from "./site-overview";

/**
 * `/llms.txt`, to the llmstxt.org format: an H1, a blockquote summary, then
 * free-form sections containing no headings, then H2-delimited link lists.
 * The when-to-use guidance sits in the pre-H2 block because the spec reserves
 * H2 sections for link lists.
 */
export const renderLlmsTxt = (): string => {
  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteSummary}`,
    "",
    ...siteIntroParagraphs.flatMap((paragraph) => [paragraph, ""]),
    `**When to use ${siteConfig.name}:**`,
    "",
    renderList(whenToUse),
    "",
    ...siteUsageParagraphs.flatMap((paragraph) => [paragraph, ""]),
    "## Pages",
    "",
    renderList(sitePageLinks),
    "",
    "## Machine-readable endpoints",
    "",
    renderList(agentEndpoints),
    "",
    "## Optional",
    "",
    renderList([
      { href: siteConfig.repository, label: "Source code", text: "the template, on GitHub" },
      {
        href: `${siteConfig.repository}/blob/main/AGENTS.md`,
        label: "AGENTS.md",
        text: "setup and verification guide for coding agents",
      },
      {
        href: `${siteConfig.repository}/issues`,
        label: "Issue tracker",
        text: "bugs and feature requests",
      },
    ]),
  ];

  return `${lines.join("\n").trimEnd()}\n`;
};
