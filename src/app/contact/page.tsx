import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { ProsePageView } from "@/components/prose-page";
import { prosePageMetadata } from "@/lib/agent/page-metadata";
import { contactPage } from "@/lib/agent/site-pages";
import { buildProsePageGraph } from "@/lib/agent/structured-data";

export const metadata: Metadata = prosePageMetadata(contactPage);

const Page = () => (
  <>
    <JsonLd node={buildProsePageGraph(contactPage)} />
    <ProsePageView page={contactPage} />
  </>
);

export default Page;
