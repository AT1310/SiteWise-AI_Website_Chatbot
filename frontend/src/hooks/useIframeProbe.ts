import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../services/api";

/**
 * Probes an iframe. If it doesn't fire `load` within `timeoutMs`, or if we
 * can't access it (X-Frame-Options / CSP), we mark it as blocked.
 * We also do a server-side check for iframe blocking headers.
 */
export function useIframeProbe(url: string, timeoutMs = 3500) {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "blocked">("loading");

  useEffect(() => {
    setStatus("loading");
    if (!url) return;

    let done = false;
    const finish = (s: "ok" | "blocked") => {
      if (done) return;
      done = true;
      setStatus(s);
    };

    // Check our backend to see if the URL allows embedding
    fetch(`${API_BASE_URL}/check-embed?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.blocked) {
          finish("blocked");
        }
      })
      .catch((err) => {
        console.error("Failed to check embed status:", err);
      });

    const timer = window.setTimeout(() => finish("blocked"), timeoutMs);
    const el = ref.current;
    
    const onLoad = () => {
      // Delay slightly so the fetch has time to block it first if it's the error page loading
      setTimeout(() => finish("ok"), 300);
    };
    const onError = () => finish("blocked");
    
    el?.addEventListener("load", onLoad);
    el?.addEventListener("error", onError);

    return () => {
      window.clearTimeout(timer);
      el?.removeEventListener("load", onLoad);
      el?.removeEventListener("error", onError);
    };
  }, [url, timeoutMs]);

  return { ref, status };
}
