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
- Vercel AI SDK ai@6 + @ai-sdk/react (via Vercel AI Gateway)
- pnpm

## AI Architecture

```
src/ai/gateway.ts                        # MODEL_ID + createModel/createImageModel — the ONE gateway entry
src/ai/agents/router.ts                  # generateObject classifier → "canvas" | "builder"
src/ai/agents/<name>-agent.ts            # ToolLoopAgent factories; tools close over the stream writer
src/ai/agents/<name>-agent-prompt.ts     # system prompts
src/ai/messages/data-parts.ts            # zod schemas + DataPart map — client<->server contract
src/ai/messages/types.ts                 # UIMessage specializations + CanvasStreamWriter
src/ai/response/stream-chat-response.ts  # route → agent.stream → writer.merge
src/app/api/chat/route.ts                # POST: zod-parse body, validateUIMessages, resolve key
```

Tools emit `writer.write({ type: "data-<key>", … })`; client `useChat.onData` zod-parses each payload (dataPartSchemas) before mutating the zustand store. Demo mode: `StaticChatTransport` (`src/components/demo-transport.ts`) when key === "demo".

## Project Structure

```
src/
├── ai/              # Agents, prompts, gateway, message contracts
├── app/             # Next.js app dir, API routes, sitemap/robots
├── components/
│   ├── canvas/      # Editor: controls/, hooks/, services/, utils/, views/
│   └── ui/          # shadcn base-vega components (Base UI)
├── data/            # Templates
├── hooks/           # Shared hooks
└── lib/             # Utils, schema, types, siteConfig
```

## Commands

```bash
pnpm dev             # Dev server
pnpm build           # Production build
pnpm lint            # oxlint
pnpm format:fix      # oxfmt
```

## Path Alias

`@/*` → `./src/*`

## Key Files

- `src/lib/schema.ts` - Block zod schemas (source of truth)
- `src/lib/types.ts` - Shared types
- `src/ai/agents/` - Agents + prompts + tools
- `src/app/globals.css` - Theme/colors
- `src/components/canvas/` - Canvas editor
