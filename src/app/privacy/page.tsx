import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { ProsePageView } from "@/components/prose-page";
import { prosePageMetadata } from "@/lib/agent/page-metadata";
import { privacyPage } from "@/lib/agent/site-pages";
import { buildProsePageGraph } from "@/lib/agent/structured-data";

export const metadata: Metadata = prosePageMetadata(privacyPage);

const Page = () => (
  <>
    <JsonLd node={buildProsePageGraph(privacyPage)} />
    <ProsePageView page={privacyPage} />
  </>
);

export default Page;
