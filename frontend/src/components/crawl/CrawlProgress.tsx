import { motion, AnimatePresence } from "framer-motion";
import { HiCheck } from "react-icons/hi2";
import { useEffect, useState } from "react";

const STEPS = [
  "Detecting crawl strategy",
  "Crawling website",
  "Processing documents",
  "Chunking content",
  "Creating embeddings",
  "Building ChromaDB",
  "Ready",
];

interface Props {
  active: boolean;
  completed: boolean;
  error?: string | null;
}

export function CrawlProgress({ active, completed, error }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!active) return;
    setCurrent(0);
    const id = window.setInterval(() => {
      setCurrent((c) => (c < STEPS.length - 2 ? c + 1 : c));
    }, 1400);
    return () => window.clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (completed) setCurrent(STEPS.length - 1);
  }, [completed]);

  return (
    <div className="glass rounded-2xl p-6">
      <ul className="space-y-3">
        {STEPS.map((label, i) => {
          const isDone = i < current || completed;
          const isCurrent = i === current && !completed;
          return (
            <li key={label} className="flex items-center gap-3">
              <div
                className={`grid h-6 w-6 place-items-center rounded-full border transition ${
                  isDone
                    ? "border-transparent bg-[oklch(0.72_0.17_155)] text-black"
                    : isCurrent
                      ? "border-brand text-brand"
                      : "border-border text-muted-foreground"
                }`}
              >
                <AnimatePresence mode="wait">
                  {isDone ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <HiCheck size={14} />
                    </motion.span>
                  ) : isCurrent ? (
                    <motion.span
                      key="spin"
                      className="block h-2 w-2 rounded-full bg-brand"
                      animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                  ) : (
                    <span className="block h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                  )}
                </AnimatePresence>
              </div>
              <span
                className={`text-sm ${
                  isDone ? "text-foreground" : isCurrent ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>
      {error && (
        <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
          {error}
        </div>
      )}
    </div>
  );
}
