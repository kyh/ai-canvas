import { serializeJsonLd } from "@/lib/agent/structured-data";

import type { JsonLdNode } from "@/lib/agent/structured-data";

export const JsonLd = ({ node }: { node: JsonLdNode }) => (
  // oxlint-disable-next-line react/no-danger -- the only way to emit a JSON-LD script body; serializeJsonLd escapes `<`, so no value can close the tag early
  <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(node) }} type="application/ld+json" />
);
