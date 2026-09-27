import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  absoluteUrl,
  renderHomeMarkdown,
  renderNotFoundMarkdown,
  renderProsePageMarkdown,
} from "./markdown";
import { findPageByPath, privacyPage, prosePages, rendersOutsideRouter } from "./site-pages";

describe("absoluteUrl", () => {
  test("prefixes site paths and leaves off-site URLs alone", () => {
    assert.equal(absoluteUrl("/about"), "https://canvas.kyh.io/about");
    assert.equal(absoluteUrl("https://github.com/kyh"), "https://github.com/kyh");
    assert.equal(absoluteUrl("mailto:a@b.c"), "mailto:a@b.c");
  });
});

describe("renderHomeMarkdown", () => {
  test("has a single H1 and when-to-use guidance", () => {
    const body = renderHomeMarkdown();
    assert.equal(body.match(/^# /gmu)?.length, 1);
    assert.ok(body.includes("## When to use this"));
    assert.ok(body.includes("(https://canvas.kyh.io/llms.txt)"));
  });
});

describe("renderProsePageMarkdown", () => {
  test("renders headings, lists and the footer", () => {
    const body = renderProsePageMarkdown(privacyPage);
    assert.ok(body.startsWith("# Privacy\n\n> "));
    assert.ok(body.includes("## What is collected"));
    assert.ok(body.includes("- **Server logs**: "));
    assert.ok(body.includes("[llms.txt](https://canvas.kyh.io/llms.txt)"));
  });

  test("gives every trust page at least 500 characters", () => {
    for (const page of prosePages) {
      assert.ok(renderProsePageMarkdown(page).length >= 500, `${page.path} too short`);
    }
  });
});

describe("renderNotFoundMarkdown", () => {
  test("echoes the path and points at recovery surfaces", () => {
    const body = renderNotFoundMarkdown("/nope");
    assert.ok(body.startsWith("# 404"));
    assert.ok(body.includes("`/nope`"));
    assert.ok(body.includes("(https://canvas.kyh.io/sitemap.xml)"));
  });
});

describe("site pages", () => {
  test("finds pages by exact path only", () => {
    assert.equal(findPageByPath("/privacy"), privacyPage);
    assert.equal(findPageByPath("/privacy/extra"), null);
  });

  test("routes files and off-site links outside the client router", () => {
    assert.equal(rendersOutsideRouter("/about"), false);
    assert.equal(rendersOutsideRouter("/llms.txt"), true);
    assert.equal(rendersOutsideRouter("mailto:a@b.c"), true);
  });
});
