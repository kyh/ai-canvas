# AI Canvas

<img width="2400" height="1260" alt="AI Canvas" src="https://github.com/user-attachments/assets/17abde19-05d3-45b9-8758-d2727b840548" />

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkyh%2Fai-canvas)

Forkable Next.js template featuring an AI design canvas — generate, edit, and compose on an infinite canvas in natural language. Build your own Canva, Figma, or tldraw alternative.

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

- Generate text, frames, and AI images (DALL-E 3) from natural language
- Visual context awareness — each request ships a PNG of the current canvas
- Build mode: convert designs to interactive HTML/CSS/JS
- Demo mode: try the AI flow keyless with a scripted transport

## Quick Start

```bash
# Clone
git clone https://github.com/kyh/ai-canvas.git
cd ai-canvas

# Install
pnpm install

# Configure (optional in dev — see API keys below)
echo "AI_GATEWAY_API_KEY=vck_..." > .env.local

# Run
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### API keys

The chat route resolves a [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) key in three ways:

1. **Dev**: `NODE_ENV=development` uses `AI_GATEWAY_API_KEY` from `.env.local` automatically.
2. **Bring your own key**: in production, users paste their own `vck_...` key into the in-app dialog (stored in localStorage).
3. **Shared secret**: set `SECRET_KEY` on the server; a user who enters that value as their key is swapped to the server's `AI_GATEWAY_API_KEY` (lets you hand out one sentinel without exposing the real key).

Or enter `demo` as the key to run the scripted demo transport — no network, no key.

## AI Architecture

Vercel AI SDK `ai@6` + `@ai-sdk/react`, model `openai/gpt-5.1-instant` via the AI Gateway.

```
src/ai/gateway.ts                        # MODEL_ID + createModel/createImageModel — single gateway entrypoint
src/ai/agents/router.ts                  # generateObject classifier → "canvas" | "builder"
src/ai/agents/canvas-agent.ts            # ToolLoopAgent: text/frame/image block tools
src/ai/agents/builder-agent.ts           # ToolLoopAgent: design → HTML document
src/ai/messages/data-parts.ts            # zod schemas + DataPart map — the client<->server contract
src/ai/response/stream-chat-response.ts  # route → agent.stream → writer.merge
src/app/api/chat/route.ts                # POST: zod-parse body, validateUIMessages, resolve key
```

**Data-parts contract**: tools stream `writer.write({ type: "data-<key>", data })`; the client's `useChat.onData` zod-parses each payload against `dataPartSchemas` before mutating the zustand store. The wire type has a `data-` prefix; the `DataPart` map keys don't.

**Router hop**: every request first runs a blocking `generateObject` classification (canvas vs builder) — one extra model round-trip of latency before tokens stream.

**Demo mode**: `src/components/demo-transport.ts` replays a scripted `StaticChatTransport` flow client-side. Known limitation: it only scripts the canvas (frame/text) path — build mode and image generation aren't mocked.

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

## Customization

**Add block types**

1. Define the schema in `src/lib/schema.ts` (types derive from it)
2. Add a generator tool in `src/ai/agents/canvas-agent.ts` + a data part in `src/ai/messages/data-parts.ts`
3. Add rendering logic in canvas
4. Create controls in `src/components/canvas/controls/`

**Customize AI**

- Prompts: `src/ai/agents/*-agent-prompt.ts`
- Tools: `src/ai/agents/canvas-agent.ts`
- Model: `src/ai/gateway.ts`

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
- Vercel AI SDK (ai@6)

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
- [Vercel AI SDK](https://sdk.vercel.ai/docs)

## License

MIT
