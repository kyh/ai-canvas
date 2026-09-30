import { Fragment } from "react";
import type { ReactNode } from "react";

import { ProseLink } from "@/components/prose-link";
import type { LinkFocus } from "@/components/prose-link";
import { sitePageLinks } from "@/lib/agent/site-overview";

import type { ProseBlock, ProseListItem, ProsePage } from "@/lib/agent/site-pages";

/** Turns `a \`b\` c` into `a <code>b</code> c`. Nothing else in the copy is markup. */
export const withInlineCode = (text: string): ReactNode =>
  text.split("`").map((segment, index) =>
    index % 2 === 1 ? (
      <code key={index} className="bg-muted text-foreground rounded px-1 py-0.5 font-mono text-xs">
        {segment}
      </code>
    ) : (
      <Fragment key={index}>{segment}</Fragment>
    ),
  );

export const ProseItem = ({ item, focus }: { item: ProseListItem; focus?: LinkFocus }) => (
  <li>
    {item.href ? (
      <ProseLink href={item.href} focus={focus}>
        {item.label}
      </ProseLink>
    ) : (
      <span className="text-foreground">{item.label}</span>
    )}
    {item.text ? <> — {withInlineCode(item.text)}</> : null}
  </li>
);

const ProseBlockView = ({ block }: { block: ProseBlock }) => {
  if (block.kind === "heading") {
    return <h2 className="text-foreground mt-4 text-lg font-medium">{block.text}</h2>;
  }
  if (block.kind === "list") {
    return (
      <ul className="flex list-disc flex-col gap-2 pl-5">
        {block.items.map((item) => (
          <ProseItem key={item.label} item={item} />
        ))}
      </ul>
    );
  }
  return <p>{withInlineCode(block.text)}</p>;
};

/** Renders the same `ProsePage` the Markdown representation is built from. */
export const ProsePageView = ({ page }: { page: ProsePage }) => (
  <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-4 p-8 lg:py-20">
    <nav aria-label="Site" className="text-muted-foreground flex gap-4 text-sm">
      {sitePageLinks.map((link) => (
        <ProseLink key={link.label} href={link.href ?? "/"}>
          {link.label}
        </ProseLink>
      ))}
    </nav>
    <h1 className="mt-8 text-3xl font-semibold">{page.heading}</h1>
    <div className="text-muted-foreground flex flex-col gap-4 border-t pt-4 leading-relaxed">
      {page.blocks.map((block, index) => (
        <ProseBlockView key={index} block={block} />
      ))}
    </div>
  </main>
);
