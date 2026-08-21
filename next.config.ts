import type { NextConfig } from "next";
import { withEve } from "eve/next";

const nextConfig: NextConfig = {
  // next dev rewrites AGENTS.md/CLAUDE.md when it detects an agent; we own those files
  agentRules: false,
};

// withEve mounts the eve agent runtime behind the Next.js origin: `next dev`
// boots the eve dev server alongside it, and on Vercel both deploy as one
// project. NEVER run `eve build` while `next dev` is running — it corrupts
// the dev workflow cache (fix: delete .eve/ + .workflow-data/ and restart).
export default withEve(nextConfig);
