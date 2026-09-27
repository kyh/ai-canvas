import { ProseItem } from "@/components/prose-page";
import { notFoundRecoveryLinks } from "@/lib/agent/markdown";

/** Same recovery list as the Markdown 404, so a person and an agent get the same places to look next. */
const NotFound = () => (
  <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-6 p-8">
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm font-medium">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
    </div>
    <nav aria-label="Where to look next" className="border-t pt-6">
      <h2 className="text-muted-foreground mb-3 text-sm font-medium">Try one of these</h2>
      <ul className="text-muted-foreground flex list-disc flex-col gap-2 pl-5 text-sm">
        {notFoundRecoveryLinks.map((item) => (
          <ProseItem key={item.label} item={item} />
        ))}
      </ul>
    </nav>
  </main>
);

export default NotFound;
