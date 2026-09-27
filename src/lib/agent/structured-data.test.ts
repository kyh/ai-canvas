import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { aboutPage } from "./site-pages";
import {
  buildHomeGraph,
  buildOrganization,
  buildProsePageGraph,
  serializeJsonLd,
} from "./structured-data";

describe("buildOrganization", () => {
  const org = buildOrganization();

  test("carries identity and a contact point, but no invented address", () => {
    assert.equal(org.name, "AI Canvas");
    assert.equal(org.url, "https://canvas.kyh.io");
    assert.ok(org.sameAs.length > 0);
    assert.equal(org.contactPoint[0]?.email, "im.kaiyu@gmail.com");
    assert.equal(org.contactPoint[0]?.contactType, "customer support");
    assert.equal("address" in org, false);
    assert.equal("telephone" in org, false);
  });
});

describe("graphs", () => {
  test("home graph links Organization, WebSite and SoftwareApplication", () => {
    const graph = buildHomeGraph()["@graph"];
    assert.deepEqual(
      graph.map((node) => node["@type"]),
      ["Organization", "WebSite", "SoftwareApplication"],
    );
  });

  test("prose graph describes the page", () => {
    const [, page] = buildProsePageGraph(aboutPage)["@graph"];
    assert.equal(page.url, "https://canvas.kyh.io/about");
  });
});

describe("serializeJsonLd", () => {
  test("escapes < so a value cannot close the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>" });
    assert.equal(out.includes("<"), false);
    assert.deepEqual(JSON.parse(out), { name: "</script><script>" });
  });
});
