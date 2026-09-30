import { ProseItem, withInlineCode } from "@/components/prose-page";
import { siteConfig } from "@/lib/config";
import {
  siteIntroParagraphs,
  sitePageLinks,
  siteUsageParagraphs,
  whenToUse,
} from "@/lib/agent/site-overview";

/**
 * The canvas renders nothing a crawler can read, so the homepage's text lives
 * here: server-rendered and visually hidden, with the same copy as /llms.txt.
 */
export const SiteIntro = () => (
  <section className="sr-only">
    <h1>{siteConfig.name} — open-source AI design canvas template</h1>
    {siteIntroParagraphs.map((paragraph) => (
      <p key={paragraph}>{paragraph}</p>
    ))}
    <h2>When to use {siteConfig.name}</h2>
    <ul>
      {whenToUse.map((item) => (
        <ProseItem key={item.label} item={item} focus="untabbable" />
      ))}
    </ul>
    {siteUsageParagraphs.map((paragraph) => (
      <p key={paragraph}>{withInlineCode(paragraph)}</p>
    ))}
    <nav aria-label="Site">
      <ul>
        {sitePageLinks.map((item) => (
          <ProseItem key={item.label} item={item} focus="untabbable" />
        ))}
      </ul>
    </nav>
  </section>
);
