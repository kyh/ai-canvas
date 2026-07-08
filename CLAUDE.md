# Agent Instructions

## Project Overview

AI Canvas - interactive canvas app w/ AI-powered design generation. Build Canva/Figma/tldraw alternatives.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript (strict; no `any`, no `as`, no `!`)
- Konva (canvas rendering)
- Zustand (state)
- shadcn base-vega on Base UI (`@base-ui/react`, `render` prop — NOT Radix/asChild)
- Tailwind CSS 4
- eve (Vercel's agent framework) + `ai@7` via Vercel AI Gateway; BYO-key via bearer auth + dynamic model resolver
- pnpm

## AI Architecture

```
agent/agent.ts                  # defineAgent: model + step.started BYO-key resolver + limits
agent/instructions.md           # system prompt (per-turn context contract, primitives-vs-HTML guidance)
agent/channels/eve.ts           # auth walk: gatewayKeyBearer → vercelOidc → localDev
agent/tools/generate_*_block.ts # defineTool; snake_case filename = tool name (text/frame/image)
agent/tools/build_html_block.ts # model writes the full HTML document as tool INPUT
agent/tools/update_html_block.ts
agent/tools/<builtin>.ts        # disableTool() sentinels (bash, web_fetch, …)
src/lib/assistant-schemas.ts    # zod contract: tool input + payload schemas (shared both sides)
src/lib/canvas-context.ts       # per-turn client context (canvas size, selection bounds, block summaries)
src/components/canvas/views/editor-bottom-toolbar.tsx  # useEveAgent bridge: clientContext + PNG snapshot out, action.result in
src/components/api-key-dialog.tsx
```

Flow: toolbar `send({ message: [text, PNG file part], clientContext })` → eve channel authenticates (user bearer key / OIDC / localhost) → dynamic model resolver picks the user's gateway key from session auth (fallback: server `AI_GATEWAY_API_KEY`) → tools return fully-formed blocks (server-generated ids; image tool calls gpt-image-1 with the same key chain) → toolbar `onEvent` zod-parses `action.result` events → zustand store mutation. `actions.requested` for `build_html_block` drops a spinner placeholder that's swapped when the result lands.

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

## Commands

```bash
pnpm dev             # Dev server — boots Next.js AND the eve agent runtime
pnpm build           # Production build (Next). Vercel builds the eve service via withEve
pnpm lint            # oxlint
pnpm format:fix      # oxfmt
```

**NEVER run `eve build` while `pnpm dev` is running** — it corrupts the eve dev workflow cache. If dev breaks mysteriously: delete `.eve/` + `.workflow-data/` and restart.

## Conventions

- Path alias: `@/*` → `./src/*` — but files imported by `agent/` code MUST use relative imports (eve's compiler doesn't read tsconfig paths)
- kebab-case filenames for TS/TSX; `agent/tools/*` are snake_case (eve derives tool names from filenames)
- No `any`, no `!`, no `as` — zod-parse at boundaries (stream events, tool payloads, localStorage)

## Key Files

- `src/lib/schema.ts` - Block zod schemas (source of truth)
- `src/lib/assistant-schemas.ts` - Tool input/payload contract
- `agent/` - Agent config, prompt, tools
- `src/app/globals.css` - Theme/colors
- `src/components/canvas/` - Canvas editor
