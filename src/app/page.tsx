import type { Metadata } from "next";

import { CanvasApp } from "@/components/canvas-app";
import { JsonLd } from "@/components/json-ld";
import { SiteIntro } from "@/components/site-intro";
import { canonicalAlternates } from "@/lib/agent/page-metadata";
import { buildHomeGraph } from "@/lib/agent/structured-data";

export const metadata: Metadata = {
  alternates: canonicalAlternates("/"),
};

const Page = () => (
  <>
    <JsonLd node={buildHomeGraph()} />
    <SiteIntro />
    <CanvasApp />
  </>
);

export default Page;
