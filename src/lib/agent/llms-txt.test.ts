import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { renderLlmsTxt } from "./llms-txt";

describe("renderLlmsTxt", () => {
  const body = renderLlmsTxt();

  test("opens with the llmstxt.org H1 and blockquote summary", () => {
    const [h1, blank, summary] = body.split("\n");
    assert.equal(h1, "# AI Canvas");
    assert.equal(blank, "");
    assert.ok(summary?.startsWith("> "), "second block should be a blockquote");
  });

  test("names when to use the product before the first H2", () => {
    const beforeH2 = body.split("\n## ")[0] ?? "";
    assert.ok(beforeH2.includes("**When to use AI Canvas:**"));
    assert.ok(beforeH2.includes("Not a fit"));
  });

  test("only uses H2 sections for link lists", () => {
    const sections = body.split("\n## ").slice(1);
    assert.deepEqual(
      sections.map((section) => section.split("\n")[0]),
      ["Pages", "Machine-readable endpoints", "Optional"],
    );
    for (const section of sections) {
      const items = section.split("\n").slice(2).filter(Boolean);
      assert.ok(items.every((line) => line.startsWith("- [")));
    }
  });

  test("links the trust pages with absolute URLs", () => {
    for (const path of ["/about", "/contact", "/privacy"]) {
      assert.ok(body.includes(`(https://canvas.kyh.io${path})`), `missing ${path}`);
    }
  });

  test("ends with exactly one newline", () => {
    assert.ok(body.endsWith("\n") && !body.endsWith("\n\n"));
  });
});
