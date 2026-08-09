import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { TopBar } from "../components/layout/TopBar";
import { WebsiteFrame } from "../components/viewer/WebsiteFrame";
import { ChatWidget } from "../components/widget/ChatWidget";
import { useSession } from "../contexts/SessionContext";

const searchSchema = z.object({
  url: z.string().optional(),
});

export const Route = createFileRoute("/website")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Website Viewer — Sitewise" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WebsitePage,
});

function WebsitePage() {
  const { url: searchUrl } = Route.useSearch();
  const { session } = useSession();
  const url = searchUrl || session?.url || "";

  if (!url) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="glass max-w-md rounded-2xl p-8 text-center">
          <h1 className="font-display text-xl font-semibold">No website loaded</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Head back home and enter a URL to index.
          </p>
          <Link
            to="/"
            className="btn-brand mt-6 inline-flex items-center rounded-full px-5 py-2 text-sm font-medium"
          >
            Go home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <TopBar url={url} title={session?.title} />
      <main className="relative flex-1 overflow-hidden">
        <WebsiteFrame
          url={url}
          fallbackContent={session?.content}
          fallbackTitle={session?.title}
        />
      </main>
      <ChatWidget url={url} sessionId={session?.session_id} />
    </div>
  );
}
