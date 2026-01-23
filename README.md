# AI Canvas

<img width="2400" height="1260" alt="AI Canvas" src="https://github.com/user-attachments/assets/17abde19-05d3-45b9-8758-d2727b840548" />

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkyh%2Fai-canvas)

A forkable Next.js template featuring a design canvas UI with AI integration. Build your own Canva, Figma, or tldraw alternative.

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
- Generate text, frames, and images
- Visual context awareness
- Build mode: convert designs to HTML/CSS/JS

## Quick Start

```bash
# Clone
git clone https://github.com/kyh/ai-canvas.git
cd ai-canvas

# Install
pnpm install

# Run
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── ai/              # AI integration, prompts, tools
├── app/             # Next.js app dir, API routes
├── components/
│   ├── canvas/      # Editor: controls/, hooks/, services/, utils/, views/
│   └── ui/          # shadcn/ui components
├── data/            # Templates
├── hooks/           # Shared hooks
└── lib/             # Utils, types
```

## Customization

**Add block types**
1. Define type in `src/lib/types.ts`
2. Create generator in `src/ai/tools/`
3. Add rendering logic in canvas
4. Create controls in `src/components/canvas/controls/`

**Customize AI**
- Prompts: `src/ai/response/`
- Tools: `src/ai/tools/`

**Theming**
- Colors: `src/app/globals.css`
- Components follow shadcn/ui patterns

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Konva (canvas)
- Zustand (state)
- Radix UI + shadcn/ui
- Tailwind CSS 4
- Vercel AI SDK

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
