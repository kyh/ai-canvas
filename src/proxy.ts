import { NextResponse } from "next/server";

import { negotiateMediaType, notAcceptableBody, withVaryAccept } from "@/lib/agent/accept";

import type { NextRequest } from "next/server";

/**
 * Markdown content negotiation, to the acceptmarkdown.com contract: one URL,
 * two representations. Pages render HTML unconditionally, so the proxy
 * rewrites Markdown-preferring requests to `/api/markdown/*` before they do.
 * <https://acceptmarkdown.com/recipes/nextjs>
 */

const MARKDOWN_ROUTE_PREFIX = "/api/markdown";

const markdownRewrite = (request: NextRequest, pathname: string) => {
  const url = request.nextUrl.clone();
  url.pathname = `${MARKDOWN_ROUTE_PREFIX}${pathname}`;
  const response = NextResponse.rewrite(url);
  // Keep Next's RSC vary tokens; a plain set would let a CDN serve a flight payload to a document request.
  response.headers.set("Vary", withVaryAccept(response.headers.get("Vary")));
  return response;
};

export const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // The `<link rel="alternate">` target; a crawler following it may send no Accept at all.
  if (pathname.endsWith(".md")) {
    const stripped = pathname.slice(0, -".md".length);
    return markdownRewrite(request, stripped === "/index" ? "" : stripped);
  }

  const accept = request.headers.get("accept");
  const chosen = negotiateMediaType(accept);

  if (chosen === "text/markdown") {
    return markdownRewrite(request, pathname === "/" ? "" : pathname);
  }

  if (chosen === null) {
    return new Response(notAcceptableBody(accept), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
        Vary: "Accept",
      },
      status: 406,
    });
  }

  return NextResponse.next();
};

/**
 * Only requests that can negotiate to Markdown invoke the proxy: a `.md` URL,
 * or an `Accept` naming markdown. Plain HTML views never pay for an invocation.
 * Case-insensitivity is spelled per character because Next and Vercel compile
 * `has` values to their own regex engines with no shared inline-flag support.
 * Excludes Next internals, route handlers, and eve's agent routes (`/eve/v1/*`).
 */
export const config = {
  matcher: [
    { source: "/((?!api/|_next/|_vercel/|_eve_internal/|eve/|favicon/).*\\.md)" },
    {
      has: [{ key: "accept", type: "header", value: ".*[Mm][Aa][Rr][Kk][Dd][Oo][Ww][Nn].*" }],
      source:
        "/((?!api/|_next/|_vercel/|_eve_internal/|eve/|favicon/|robots\\.txt$|sitemap\\.xml$|llms\\.txt$|og\\.jpg$).*)",
    },
  ],
};
