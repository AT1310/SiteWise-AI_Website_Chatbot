import { Link } from "@tanstack/react-router";
import { HiArrowLeft, HiArrowTopRightOnSquare, HiCheckCircle } from "react-icons/hi2";
import { Logo } from "../common/Logo";
import { hostnameOf } from "../../utils/url";

interface Props {
  url: string;
  title?: string;
}

export function TopBar({ url, title }: Props) {
  return (
    <header className="glass sticky top-0 z-30 flex items-center gap-3 border-b border-border px-4 py-2.5">
      <Link
        to="/"
        className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground"
        aria-label="Back"
      >
        <HiArrowLeft size={18} />
      </Link>

      <div className="hidden md:block">
        <Logo size={28} />
      </div>

      <div className="mx-2 hidden h-6 w-px bg-border md:block" />

      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-white/5 px-3 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.72_0.17_155)]" />
        <span className="truncate text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {title ?? hostnameOf(url)}
          </span>
          <span className="mx-2 text-border">·</span>
          <span className="truncate">{url}</span>
        </span>
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-[oklch(0.72_0.17_155)]/30 bg-[oklch(0.72_0.17_155)]/10 px-3 py-1 text-xs font-medium text-[oklch(0.85_0.15_155)] sm:inline-flex">
        <HiCheckCircle size={14} /> Indexed
      </div>

      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground"
        aria-label="Open original"
      >
        <HiArrowTopRightOnSquare size={16} />
      </a>
    </header>
  );
}
