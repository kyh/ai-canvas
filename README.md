# AI Canvas

<img width="2400" height="1260" alt="AI Canvas" src="https://github.com/user-attachments/assets/17abde19-05d3-45b9-8758-d2727b840548" />

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkyh%2Fai-canvas)

Forkable Next.js template featuring an AI design canvas — generate, edit, and compose on an infinite canvas in natural language. Build your own Canva, Figma, or tldraw alternative. Built on [eve](https://eve.dev), Vercel's agent framework.

## Features

**Canvas**

- Interactive editor with zoom, pan, multi-select
- Text, frame, and image blocks
- Layer management, transform controls, hotkeys

**Styling**

- Text: font, size, color, alignment, spacing, decoration
- Frames: colors, borders, shadows, opacity, radius, rotation
- Advanced color picker with opacity

**AI**

- One agent, five tools: generate text, frames, and AI images (gpt-image-1), or build/update live interactive HTML blocks — no router hop
- Visual context awareness — each request ships a PNG snapshot of the canvas (or the selection) plus a structured JSON context (canvas size, selection bounds, selected blocks)
- Loading placeholder for HTML builds — a spinner block appears the moment the agent starts writing markup and is swapped for the finished block
- Bring your own key — visitors add their own [Vercel AI Gateway key](https://vercel.com/docs/ai-gateway) (stored in the browser) and the agent runs on it per session

## Quick Start

```bash
# Clone
git clone https://github.com/kyh/ai-canvas.git
cd ai-canvas

# Install
pnpm install

# Configure (dev) — copy the example, then set AI_GATEWAY_API_KEY=vck_...
cp .env.example .env.local

# Run
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

`pnpm dev` boots both runtimes: the Next.js dev server and eve's agent dev server (proxied same-origin by `withEve`). In development the agent uses `AI_GATEWAY_API_KEY`; in production, keyless visitors are prompted for their own gateway key, which rides each request as a bearer token and backs a per-session model.

Driving this repo with a coding agent? [`AGENTS.md`](AGENTS.md) is the runnable guide — provisioning, the static gate (`pnpm verify`), and a browser recipe for verifying a change end to end.

## AI Architecture

eve agent runtime + `ai@7`, model `openai/gpt-5.1-instant` (images: `openai/gpt-image-1`) via the Vercel AI Gateway.

```
agent/
├── agent.ts                    # defineAgent: gateway model + BYO-key dynamic model resolver
├── instructions.md             # system prompt: per-turn context contract, primitives-vs-HTML guidance
├── channels/eve.ts             # HTTP auth: user bearer key → Vercel OIDC → localhost dev
└── tools/
    ├── generate_text_block.ts  # defineTool — filename = tool name the model sees
    ├── generate_frame_block.ts
    ├── generate_image_block.ts # gpt-image-1 via the gateway's typed imageModel entrypoint
    ├── build_html_block.ts     # model writes a full HTML document as tool INPUT
    ├── update_html_block.ts
    └── *.ts                    # disableTool() sentinels for the built-in harness tools
next.config.ts                  # withEve(nextConfig) — mounts eve behind the Next.js origin
src/lib/assistant-schemas.ts    # zod contract shared by agent tools + toolbar bridge
src/lib/canvas-context.ts       # per-turn client context (canvas size, selection, block summaries)
src/components/canvas/views/editor-bottom-toolbar.tsx  # useEveAgent bridge
```

The streaming contract: the toolbar sends each prompt with a PNG snapshot (AI SDK `UserContent` file part) and a JSON `clientContext`; every tool returns the fully-formed block, which the toolbar receives as an `action.result` stream event, zod-parses against `assistant-schemas.ts`, and applies to the zustand store. HTML builds additionally hook `actions.requested` to drop a spinner placeholder before the tool result lands.

## Project Structure

```
src/
├── app/             # Next.js app dir, sitemap/robots
├── components/
│   ├── canvas/      # Editor: controls/, hooks/, services/, utils/, views/
│   └── ui/          # shadcn base-vega components (Base UI)
├── data/            # Templates
├── hooks/           # Shared hooks
└── lib/             # Utils, schema, assistant contract, siteConfig
```

## Customization

**Add block types**

1. Define the schema in `src/lib/schema.ts` (types derive from it)
2. Add a tool in `agent/tools/` + its input/payload schemas in `src/lib/assistant-schemas.ts`
3. Handle its `action.result` in the toolbar bridge
4. Add rendering logic in canvas + controls in `src/components/canvas/controls/`

**Customize AI**

- Prompt: `agent/instructions.md` (+ per-tool descriptions in `agent/tools/`)
- Model: `agent/agent.ts` (image model: `agent/tools/generate_image_block.ts`)

**Theming / branding**

- Colors: `src/app/globals.css`
- Components follow shadcn (base-vega / Base UI) patterns
- Site name/URL/description: `src/lib/config.ts`
- Replace `public/og.jpg` (placeholder copied from kyh.io) with your own 1920x1080 image

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Konva (canvas)
- Zustand (state)
- shadcn base-vega on Base UI
- Tailwind CSS 4
- eve + Vercel AI SDK (ai@7)

## Notes

- Never run `eve build` while `pnpm dev` is running — it corrupts eve's dev cache (fix: delete `.eve/` + `.workflow-data/` and restart).

## Use Cases

- Design tools (Canva/Figma alternative)
- Prototyping apps
- Diagram editors
- Presentation builders
- Whiteboard apps

## Resources

- [Next.js](https://nextjs.org/docs)
- [Konva](https://konvajs.org/docs/)
- [shadcn/ui](https://ui.shadcn.com/)
- [eve](https://eve.dev)
