import { MARKDOWN_CONTENT_TYPE } from "@/lib/agent/accept";
import {
  renderHomeMarkdown,
  renderNotFoundMarkdown,
  renderProsePageMarkdown,
} from "@/lib/agent/markdown";
import { findPageByPath } from "@/lib/agent/site-pages";

interface MarkdownParams {
  params: Promise<{ slug?: string[] }>;
}

/**
 * The Markdown half of content negotiation; `src/proxy.ts` rewrites here.
 * Not a public contract. Unknown paths answer 404 with a Markdown body that
 * points at the recovery surfaces.
 */
const buildBody = (segments: string[]) => {
  if (segments.length === 0) {
    return { body: renderHomeMarkdown(), status: 200 };
  }

  const pathname = `/${segments.join("/")}`;
  const page = findPageByPath(pathname);
  if (page) {
    return { body: renderProsePageMarkdown(page), status: 200 };
  }

  return { body: renderNotFoundMarkdown(pathname), status: 404 };
};

export const GET = async (_request: Request, { params }: MarkdownParams) => {
  const { slug = [] } = await params;
  const { body, status } = buildBody(slug);

  return new Response(body, {
    headers: {
      "Cache-Control":
        status === 200
          ? "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
          : "no-store",
      "Content-Type": MARKDOWN_CONTENT_TYPE,
      Vary: "Accept",
    },
    status,
  });
};
