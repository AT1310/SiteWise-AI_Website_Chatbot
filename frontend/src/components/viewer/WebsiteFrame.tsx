import { useIframeProbe } from "../../hooks/useIframeProbe";
import { API_BASE_URL } from "../../services/api";

interface Props {
  url: string;
  fallbackContent?: string;
  fallbackTitle?: string;
}

export function WebsiteFrame({ url, fallbackContent, fallbackTitle }: Props) {
  const { ref, status } = useIframeProbe(url);

  // If the iframe gets blocked (e.g., by X-Frame-Options or CSP), 
  // we route the source to our own proxy endpoint to strip those headers.
  const iframeUrl = status === "blocked" ? `${API_BASE_URL}/proxy?url=${encodeURIComponent(url)}` : url;

  return (
    <div className="relative h-full w-full bg-white">
      {status === "loading" && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-background/60 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-2 w-2 animate-ping rounded-full bg-brand" />
            Loading {url}…
          </div>
        </div>
      )}
      <iframe
        ref={status === "blocked" ? undefined : ref}
        src={iframeUrl}
        title={fallbackTitle ?? url}
        className="h-full w-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
