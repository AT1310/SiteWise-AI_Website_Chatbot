import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { HiArrowRight, HiGlobeAlt } from "react-icons/hi2";
import { Logo } from "../components/common/Logo";
import { CrawlProgress } from "../components/crawl/CrawlProgress";
import { CrawlStats } from "../components/crawl/CrawlStats";
import { useSession } from "../contexts/SessionContext";
import { crawlWebsite } from "../services/crawl";
import { apiErrorMessage } from "../services/api";
import { hostnameOf, isValidUrl, normalizeUrl } from "../utils/url";

const SUGGESTIONS = [
  "https://react.dev",
  "https://docs.python.org/3/",
  "https://fastapi.tiangolo.com",
  "https://docs.docker.com",
];

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const { setSessionFromCrawl, session } = useSession();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (raw?: string) => {
    const target = normalizeUrl(raw ?? url);
    if (!isValidUrl(target)) {
      setError("Please enter a valid website URL.");
      return;
    }
    setError(null);
    setDone(false);
    setLoading(true);
    try {
      const resp = await crawlWebsite({ url: target });
      const s = setSessionFromCrawl(target, resp);
      setDone(true);
      // brief pause so users see the final tick
      setTimeout(() => {
        navigate({ to: "/website", search: { url: s.url } });
      }, 700);
    } catch (e) {
      setError(apiErrorMessage(e));
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70"
           style={{ background: "var(--gradient-hero)" }} />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
      </header>

      <section className="mx-auto max-w-3xl px-6 pt-10 pb-24 text-center sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-3 py-1 text-xs text-muted-foreground"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[oklch(0.72_0.17_155)]" />
          AI Website Chatbot · beta
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
        >
          Chat with <span className="text-gradient">any website</span>.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg"
        >
          Paste a URL. We'll crawl it, embed it, and give you a floating AI
          assistant that answers from the page — with sources.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          className="glass mx-auto mt-10 flex w-full max-w-2xl items-center gap-2 rounded-full p-2"
        >
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-muted-foreground">
            <HiGlobeAlt size={20} />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            placeholder="https://react.dev"
            className="flex-1 bg-transparent px-1 text-base outline-none placeholder:text-muted-foreground/70"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="btn-brand flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            {loading ? "Indexing…" : "Open AI Website"}
            <HiArrowRight />
          </button>
        </motion.form>

        {!loading && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-muted-foreground">Try:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setUrl(s); submit(s); }}
                className="rounded-full border border-border bg-white/5 px-3 py-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
              >
                {hostnameOf(s)}
              </button>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="mx-auto mt-6 max-w-xl rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {(loading || done) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-10 max-w-2xl space-y-4 text-left"
          >
            <CrawlProgress active={loading} completed={done} error={error} />
            <CrawlStats session={session} loading={loading} />
          </motion.div>
        )}
      </section>
    </main>
  );
}
