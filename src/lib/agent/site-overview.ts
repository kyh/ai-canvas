import { siteConfig } from "@/lib/config";

import type { ProseListItem } from "./site-pages";

/**
 * The single description of what this site is and when an agent should reach
 * for it. Consumed by the homepage text layer, `/llms.txt`, and the Markdown
 * representation of `/`, so all three say the same thing.
 */

export const siteSummary = `${siteConfig.name} is an open-source Next.js template for building an AI design canvas — an infinite canvas where an agent generates and edits text, shapes, images, and live HTML from plain-language prompts.`;

export const siteIntroParagraphs: string[] = [
  `${siteConfig.name} is a forkable starting point for your own Canva, Figma, or tldraw alternative with AI built in. The homepage is the live editor: describe what you want in the prompt bar and the agent places text blocks, frames, AI-generated images, or interactive HTML directly on the canvas, where you keep editing them by hand.`,
  "The editor supports zoom, pan, multi-select, layers, transform handles, and keyboard shortcuts, with per-block controls for fonts, colors, borders, shadows, opacity, radius, and rotation. Every agent request carries a snapshot of the canvas or the current selection plus a structured summary of its blocks, so the model edits what you are looking at.",
  `It runs one eve agent (Vercel's agent framework) on AI SDK 7 through the Vercel AI Gateway, with no database and no login. Visitors bring their own AI Gateway key, stored in the browser. The code is MIT licensed at ${siteConfig.repository}.`,
];

/** Concrete about the jobs this is right for — and the ones it is not, so an agent can rule it out fast. */
export const whenToUse: ProseListItem[] = [
  {
    label: "Starting an AI-native design or whiteboard product",
    text: "fork it when the ask is a canvas editor where users prompt an agent to create and modify visual blocks, rather than building the canvas, tool calling, and streaming from scratch",
  },
  {
    label: "Looking for a reference eve + AI SDK 7 app",
    text: "it shows a single agent with typed tools, per-session bring-your-own-key model resolution, and a client bridge that folds tool results into app state",
  },
  {
    label: "Prototyping a layout, slide, or social graphic by prompt",
    text: "the hosted demo generates and arranges text, frames, and images on a 1280×720 canvas that can be exported",
  },
  {
    label: "Not a fit",
    text: "it is not a hosted design service, has no public API, no accounts, no saved projects, and no collaboration — the demo is a showcase and the source is the product",
  },
];

/** How to read the site as an agent, as prose. */
export const siteUsageParagraphs: string[] = [
  "Reading it as an agent: send `Accept: text/markdown` to any page URL — or append `.md` to it — and the same page comes back as Markdown instead of HTML. `/llms.txt` carries this overview in one request, and `/sitemap.xml` lists every indexable URL.",
  `Using it: clone ${siteConfig.repository}, run \`pnpm install\`, set \`AI_GATEWAY_API_KEY\` in \`.env.local\`, and run \`pnpm dev\`. AGENTS.md in the repo is a runnable guide written for coding agents.`,
];

export const agentEndpoints: ProseListItem[] = [
  { href: "/llms.txt", label: "/llms.txt", text: "this overview, for language models" },
  { href: "/sitemap.xml", label: "/sitemap.xml", text: "every indexable URL on the site" },
  { href: "/index.md", label: "/index.md", text: "the homepage as Markdown" },
];

export const sitePageLinks: ProseListItem[] = [
  { href: "/", label: "Home", text: "the live AI canvas editor" },
  { href: "/about", label: "About", text: "what this is, how it works, how to fork it" },
  { href: "/contact", label: "Contact", text: "email and GitHub issues" },
  { href: "/privacy", label: "Privacy", text: "what is collected and who processes it" },
];
