import { MARKDOWN_CONTENT_TYPE } from "@/lib/agent/accept";
import { renderLlmsTxt } from "@/lib/agent/llms-txt";

export const GET = () =>
  new Response(renderLlmsTxt(), {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": MARKDOWN_CONTENT_TYPE,
    },
  });
