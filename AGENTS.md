# AGENTS.md

**ai-canvas** is a forkable Next.js template: an infinite design canvas (Konva + Zustand) driven by a single [eve](https://eve.dev) agent that generates text, frame, image and live-HTML blocks. One package, one surface, no database and no accounts. This is the tool-agnostic guide for coding agents — it's meant to be run, not just read. Claude also reads `CLAUDE.md`; both point back here.

## Quickstart (headless)

```sh
pnpm install
cp .env.example .env.local     # then set AI_GATEWAY_API_KEY=vck_…
pnpm dev                       # → http://localhost:3000
```

`pnpm dev` boots **two** runtimes: the Next.js dev server and eve's agent dev server, mounted same-origin by `withEve(nextConfig)` in `next.config.ts`. There is **no Docker step, no database, no migration, no seed** — canvas state lives in the browser and the only backend is the agent.

Liveness: `curl -s -o /dev/null -w '%{http_code}' localhost:3000` → `200`.

Without a key the app still boots and the whole canvas editor works; only agent turns fail (the model call has no credential). Keys come from the [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) and look like `vck_…`.

## Fresh clone & remote sessions

Everything is committed except `node_modules` and `.env.local`:

```sh
gh repo create my-canvas --template kyh/ai-canvas --clone && cd my-canvas
pnpm install
printf 'AI_GATEWAY_API_KEY=vck_…\n' > .env.local
pnpm dev
```

Committed agent-facing files: `AGENTS.md` (this file), `CLAUDE.md` (Claude-specific conventions), `.claude/settings.json` (prompt + permission allowlist), `.claude/launch.json` (launch config `web` → `pnpm dev`, port 3000), `.mcp.json` (the `next-devtools` MCP server), and `agent/instructions.md` (the _model's_ system prompt — not agent guidance for you).

No cloud-runner descriptor is committed (`.superset/` is gitignored), so a sandbox provisions with the two commands above and nothing else.

## There is no login — the gate is an API key

This template has no auth, no users and no seeded account. What gates the AI path is a Vercel AI Gateway key, and it resolves differently per environment:

- **`pnpm dev`** — `needsKey` is `false` (`src/components/canvas/views/editor-bottom-toolbar.tsx`: `!apiKey && process.env.NODE_ENV !== "development"`), so no dialog appears and turns run on the server's `AI_GATEWAY_API_KEY`. The channel auth walk in `agent/channels/eve.ts` (`gatewayKeyBearer → vercelOidc → localDev`) falls through to `localDev()`.
- **A production build** (`pnpm build && pnpm start`) — a keyless visitor gets a 401 from the channel and the key dialog. It is mounted **twice**, with independent state: the bottom toolbar (opens on textarea focus) and the gear button in the left sidebar. Either one writes `localStorage["gateway-api-key"]`; the toolbar reads it back on every request into an `Authorization: Bearer` header.

To drive a production build headlessly, pre-seed that key instead of clicking through a dialog:

```sh
agent-browser open http://localhost:3000
agent-browser storage local set gateway-api-key vck_…
agent-browser reload
```

The canvas always opens on a demo template (one image, two text blocks) — that's the fixture to verify against, in place of seeded rows.

## Verify a change end-to-end

Static gate — run before every commit:

```sh
pnpm verify     # typecheck · lint · format
```

There is no test suite and no CI workflow in this repo: `pnpm verify` plus `pnpm build` is the entire static gate, and nothing runs it for you on a PR.

Runtime — the web app is the only driveable surface. With `pnpm dev` running, use [agent-browser](https://github.com/vercel-labs/agent-browser):

```sh
agent-browser open http://localhost:3000
agent-browser snapshot -i                                  # interactive tree with @eN refs
agent-browser fill @e17 "Add a text block that says Hello" # the prompt textarea
agent-browser press Enter                                  # Shift+Enter inserts a newline
agent-browser snapshot -i                                  # Layers list gains "Select Hello Text"
agent-browser screenshot /tmp/canvas.png
```

Notes that make this actually work:

- **Refs are per-snapshot.** Re-snapshot after every action; never reuse an `@eN` from an earlier call.
- The prompt box is `textbox "Describe what you want to create..."`, inside the toolbar's **AI** tab — selected by default, so no tab click is needed.
- The canvas is a `<canvas>` element, so its contents are not in the accessibility tree. **Assert on the left "Layers" panel** (`button "Select <label>"`), which lists every block; use a screenshot only for human eyes.
- A turn takes ~10–30s and spends gateway credits. Run one, not a loop.
- If another dev server already holds port 3000, Next picks another port and prints it — read the banner instead of assuming 3000.

## Platform matrix

| Surface                | Dev command          | Agent-verifiable at runtime?                     |
| ---------------------- | -------------------- | ------------------------------------------------ |
| Web (Next.js + canvas) | `pnpm dev`           | **Yes** — headless via agent-browser             |
| eve agent runtime      | booted by `pnpm dev` | Only through the web UI (no direct route to hit) |

## Rules that matter

- **Files imported by `agent/` code MUST use relative imports.** eve's compiler doesn't read tsconfig `paths`, so `@/…` breaks there. `src/lib/assistant-schemas.ts` and `src/lib/schema.ts` are imported from both sides — keep them relative-import clean.
- **`agent/tools/*` filenames are snake_case** because eve derives the model-visible tool name from the filename. Everything else in the repo is kebab-case.
- **Never run `eve build` while `pnpm dev` is running** — it corrupts eve's dev workflow cache. Recovery: delete `.eve/` and `.workflow-data/`, restart.
- **No `any`, no non-null `!`, no `as` casts.** Zod-parse at boundaries: stream events, tool payloads, localStorage.
- Never commit `.env` / `.env.local`. New env vars go in `.env.example`.

## Map

- `agent/agent.ts` — `defineAgent` + the BYO-key dynamic model resolver · `agent/instructions.md` — system prompt · `agent/channels/eve.ts` — HTTP auth walk · `agent/tools/*` — one file per tool
- `src/lib/schema.ts` — block schemas (source of truth) · `src/lib/assistant-schemas.ts` — the tool input/payload contract shared by both sides · `src/lib/canvas-context.ts` — per-turn client context
- `src/components/canvas/` — the editor (`views/`, `controls/`, `hooks/`, `services/`, `utils/`); `views/editor-bottom-toolbar.tsx` is the `useEveAgent` bridge
- `src/components/ui/` — shadcn base-vega components (Base UI `render` prop, not Radix `asChild`)
- `CLAUDE.md` — conventions + command list · `README.md` — the human-facing tour
