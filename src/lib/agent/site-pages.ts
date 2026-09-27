import { siteConfig } from "@/lib/config";

/**
 * The prose pages, authored once and rendered twice: as JSX by
 * `app/<page>/page.tsx` and as Markdown by the content-negotiated
 * `/api/markdown` handler, so the two representations can't drift.
 */

export interface ProseListItem {
  label: string;
  /** When present the label renders as a link. */
  href?: string;
  /** Trailing note, rendered after an em dash. */
  text?: string;
}

export type ProseBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "list"; items: ProseListItem[] };

export interface ProsePage {
  /** Route path, also the canonical URL suffix and the sitemap entry. */
  path: string;
  /** The page's single `<h1>` and the Markdown `#` heading. */
  heading: string;
  /** `<title>` (the layout appends the site name). */
  title: string;
  /** Meta description, the llms.txt note, and the Markdown summary. */
  description: string;
  blocks: ProseBlock[];
}

/** Off-site links and route handlers (`/llms.txt`, `/sitemap.xml`) must be plain `<a>`, not `next/link`. */
export const rendersOutsideRouter = (href: string): boolean => {
  if (!href.startsWith("/")) {
    return true;
  }
  const lastSegment = href.split(/[?#]/u)[0]?.split("/").pop() ?? "";
  return lastSegment.includes(".");
};

export const aboutPage: ProsePage = {
  blocks: [
    {
      kind: "paragraph",
      text: `${siteConfig.name} is an open-source, forkable Next.js template for building your own AI design tool — a Canva, Figma, or tldraw alternative where the canvas can be driven in plain language. Type what you want and an agent places text, shapes, generated images, or live interactive HTML directly onto an infinite canvas, where you can keep editing it by hand.`,
    },
    {
      kind: "paragraph",
      text: "The editor is a full canvas, not a chat window: zoom, pan, multi-select, layers, transform handles, keyboard shortcuts, and per-block controls for fonts, colors, borders, shadows, opacity, radius, and rotation. The agent sees what you see — every request ships a snapshot of the canvas (or just your selection) plus a structured summary of the blocks on it, so instructions like “make this headline bolder” or “add a pricing card next to the selected frame” land where you mean.",
    },
    {
      kind: "paragraph",
      text: "Under the hood it runs a single eve agent (Vercel's open-source agent framework) on AI SDK 7, calling models through the Vercel AI Gateway. Five tools cover the whole surface: generate a text block, a frame, or an AI image, and build or update a live HTML block. There is no database and no login — canvas state lives in your browser, and the only backend is the agent.",
    },
    {
      kind: "paragraph",
      text: `${siteConfig.name} is built and maintained by ${siteConfig.author.name}. The hosted demo is a showcase; the point is the source, which you can fork, rebrand, and extend with your own block types and tools.`,
    },
    { kind: "heading", text: "Using the template" },
    {
      items: [
        {
          href: siteConfig.repository,
          label: "Source on GitHub",
          text: "fork it, or start a new repo from the template",
        },
        {
          href: `${siteConfig.repository}/blob/main/AGENTS.md`,
          label: "AGENTS.md",
          text: "the runnable setup guide for coding agents: install, one env var, `pnpm dev`",
        },
        {
          href: "https://vercel.com/docs/ai-gateway",
          label: "Vercel AI Gateway",
          text: "where the `vck_…` key the demo asks for comes from",
        },
        {
          label: "License",
          text: "MIT — use it in personal and commercial projects",
        },
      ],
      kind: "list",
    },
  ],
  description: `What ${siteConfig.name} is, how the canvas and its agent work, and how to fork the template.`,
  heading: `About ${siteConfig.name}`,
  path: "/about",
  title: "About",
};

export const contactPage: ProsePage = {
  blocks: [
    {
      kind: "paragraph",
      text: `${siteConfig.name} is built and maintained by ${siteConfig.author.name}. There is no support desk and no contact form — email and GitHub are the two channels, and both reach the same person.`,
    },
    {
      kind: "paragraph",
      text: "Email is best for anything private: licensing questions, collaboration or consulting on an AI canvas product built from this template, press, or a privacy request. Expect a reply within a few business days.",
    },
    {
      kind: "paragraph",
      text: "For anything about the code itself — a bug in the editor, an agent tool that misbehaves, a setup step that fails on a fresh fork, or an idea for a new block type — open a GitHub issue instead. Keeping it public means the next person who hits the same thing can find the answer, and pull requests are welcome.",
    },
    { kind: "heading", text: "Channels" },
    {
      items: [
        {
          href: `mailto:${siteConfig.email}`,
          label: siteConfig.email,
          text: "general enquiries, licensing, privacy requests",
        },
        {
          href: `${siteConfig.repository}/issues`,
          label: "GitHub issues",
          text: "bugs, setup problems, feature requests",
        },
        {
          href: "https://x.com/kaiyuhsu",
          label: `${siteConfig.creator} on X`,
          text: "updates as the template ships",
        },
      ],
      kind: "list",
    },
  ],
  description: `How to reach the maintainer of ${siteConfig.name} — email and GitHub issues.`,
  heading: "Contact",
  path: "/contact",
  title: "Contact",
};

export const privacyPage: ProsePage = {
  blocks: [
    {
      kind: "paragraph",
      text: `${siteConfig.name} has no accounts, no database, and no advertising or third-party trackers. Nothing is sold, rented, or shared with data brokers. What you draw lives in your browser tab and is gone when you close it.`,
    },
    { kind: "heading", text: "What is collected" },
    {
      items: [
        {
          href: "https://vercel.com/docs/analytics/privacy-policy",
          label: "Analytics",
          text: "Vercel Web Analytics and Speed Insights record aggregate page views and performance metrics. They set no cookies and build no cross-site profile",
        },
        {
          label: "Server logs",
          text: "the site is hosted on Vercel, whose edge network keeps short-lived request logs including IP address and user agent",
        },
        {
          label: "Browser storage",
          text: "your light/dark theme and, if you enter one, your Vercel AI Gateway key are kept in your browser's local storage. Clearing site data removes both",
        },
      ],
      kind: "list",
    },
    { kind: "heading", text: "When you use the AI agent" },
    {
      kind: "paragraph",
      text: "Each prompt is sent to the agent running on this site together with a PNG snapshot of the canvas (or your selection) and a JSON summary of its blocks. The agent forwards that to OpenAI models through the Vercel AI Gateway to generate the result. Your gateway key rides each request as a bearer token so the model call is billed to your own gateway account; the app does not write it to any database.",
    },
    { kind: "heading", text: "Processors" },
    {
      items: [
        {
          href: "https://vercel.com/legal/privacy-policy",
          label: "Vercel",
          text: "hosting, analytics, the agent runtime, and the AI Gateway",
        },
        {
          href: "https://openai.com/policies/privacy-policy",
          label: "OpenAI",
          text: "the text and image models the agent calls",
        },
      ],
      kind: "list",
    },
    {
      kind: "paragraph",
      text: `Questions about any of this go to ${siteConfig.email}.`,
    },
  ],
  description: `What ${siteConfig.name} collects, what stays in your browser, and who processes agent requests.`,
  heading: "Privacy",
  path: "/privacy",
  title: "Privacy",
};

export const prosePages: ProsePage[] = [aboutPage, contactPage, privacyPage];

export const findPageByPath = (pathname: string): ProsePage | null =>
  prosePages.find((page) => page.path === pathname) ?? null;
