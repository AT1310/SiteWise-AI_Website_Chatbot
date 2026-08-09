import { HiLink } from "react-icons/hi2";
import type { ChatSource } from "../../types/api";
import { hostnameOf } from "../../utils/url";

export function Sources({ sources }: { sources: ChatSource[] }) {
  if (!sources?.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {sources.slice(0, 6).map((s, i) => {
        const label = s.title || (s.url ? hostnameOf(s.url) : `Source ${i + 1}`);
        const href = s.url;
        const Inner = (
          <>
            <HiLink size={11} />
            <span className="max-w-[180px] truncate">{label}</span>
          </>
        );
        return href ? (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
          >
            {Inner}
          </a>
        ) : (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground"
          >
            {Inner}
          </span>
        );
      })}
    </div>
  );
}
