import Link from "next/link";
import type { ReactNode } from "react";

import { rendersOutsideRouter } from "@/lib/agent/site-pages";

const className = "text-foreground hover:text-primary underline underline-offset-4 transition";

export const ProseLink = ({ href, children }: { href: string; children: ReactNode }) => {
  if (!rendersOutsideRouter(href)) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }
  const offSite = href.startsWith("http") || href.startsWith("mailto:");
  return (
    <a
      className={className}
      href={href}
      rel={offSite ? "noreferrer" : undefined}
      target={offSite ? "_blank" : undefined}
    >
      {children}
    </a>
  );
};
