import Link from "next/link";
import type { ReactNode } from "react";

import { rendersOutsideRouter } from "@/lib/agent/site-pages";

const className = "text-foreground hover:text-primary underline underline-offset-4 transition";

/** `untabbable` is for links inside visually hidden blocks, so keyboard focus never lands on something invisible. */
export type LinkFocus = "tabbable" | "untabbable";

export const ProseLink = ({
  href,
  children,
  focus = "tabbable",
}: {
  href: string;
  children: ReactNode;
  focus?: LinkFocus;
}) => {
  const tabIndex = focus === "untabbable" ? -1 : undefined;
  if (!rendersOutsideRouter(href)) {
    return (
      <Link
        className={className}
        href={href}
        prefetch={focus === "untabbable" ? false : undefined}
        tabIndex={tabIndex}
      >
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
      tabIndex={tabIndex}
      target={offSite ? "_blank" : undefined}
    >
      {children}
    </a>
  );
};
