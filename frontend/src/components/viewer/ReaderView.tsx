import { HiArrowTopRightOnSquare, HiDocumentText } from "react-icons/hi2";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { hostnameOf } from "../../utils/url";

interface Props {
  url: string;
  title?: string;
  content?: string;
}

export function ReaderView({ url, title, content }: Props) {
  return (
    <div className="scrollbar-thin h-full w-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-white/5 px-4 py-3 text-sm">
          <HiDocumentText className="text-brand" size={18} />
          <div className="flex-1">
            <div className="font-medium">Reader view</div>
            <div className="text-xs text-muted-foreground">
              This site blocks embedding, so we're showing the indexed content.
            </div>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-white/10"
          >
            Open {hostnameOf(url)} <HiArrowTopRightOnSquare />
          </a>
        </div>

        {title && (
          <h1 className="mb-4 font-display text-3xl font-bold tracking-tight">{title}</h1>
        )}

        {content ? (
          <article className="md-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </article>
        ) : (
          <div className="rounded-xl border border-border bg-white/5 p-8 text-center text-sm text-muted-foreground">
            The website has been indexed and is ready to chat with. Ask the
            floating AI assistant anything about{" "}
            <span className="font-medium text-foreground">{hostnameOf(url)}</span>.
          </div>
        )}
      </div>
    </div>
  );
}
