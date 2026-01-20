# Agent Instructions

## Project Overview

AI Canvas - interactive canvas app w/ AI-powered design generation. Build Canva/Figma/tldraw alternatives.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript (strict)
- Konva (canvas rendering)
- Zustand (state)
- Radix UI + shadcn/ui
- Tailwind CSS 4
- Vercel AI SDK
- pnpm

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

## Commands

```bash
pnpm dev             # Dev server
pnpm build           # Production build
pnpm lint            # ESLint
```

## Path Alias

`@/*` → `./src/*`

## Key Files

- `src/lib/types.ts` - Block type definitions
- `src/ai/tools/` - AI generator tools
- `src/ai/response/` - AI prompts
- `src/app/globals.css` - Theme/colors
- `src/components/canvas/` - Canvas editor
