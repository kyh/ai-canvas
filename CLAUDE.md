# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

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

## Quick Reference (bd)

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

