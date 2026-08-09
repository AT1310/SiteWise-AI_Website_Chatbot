import { motion } from "framer-motion";
import { formatDuration, formatNumber } from "../../utils/format";
import type { WebsiteSession } from "../../contexts/SessionContext";

interface Props {
  session: WebsiteSession | null;
  loading?: boolean;
}

export function CrawlStats({ session, loading }: Props) {
  const items = [
    { label: "Pages Crawled", value: formatNumber(session?.stats?.pages_crawled) },
    { label: "Documents", value: formatNumber(session?.stats?.documents_processed) },
    { label: "Chunks", value: formatNumber(session?.stats?.chunks_created) },
    { label: "Time Taken", value: formatDuration(session?.stats?.time_taken as number | string) },
    { label: "Strategy", value: session?.strategy ?? "—" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {items.map((it, i) => (
        <motion.div
          key={it.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass rounded-xl p-4"
        >
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {it.label}
          </div>
          <div className="mt-1 truncate font-display text-lg font-semibold">
            {loading && !session ? "…" : it.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
