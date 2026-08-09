import { useState } from 'react';
import ReaderView from './ReaderView';

interface WebsiteViewerProps {
  url: string;
  title: string;
}

export default function WebsiteViewer({ url, title }: WebsiteViewerProps) {
  const [iframeBlocked, setIframeBlocked] = useState(false);

  if (iframeBlocked) {
    return <ReaderView url={url} title={title} />;
  }

  return (
    <div className="h-full w-full relative bg-[#0a0a0f]">
      <iframe
        src={url}
        title={title}
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        onError={() => setIframeBlocked(true)}
        onLoad={(e) => {
          // Detect if iframe was blocked — some browsers fire onLoad even when blocked
          try {
            const frame = e.currentTarget;
            // Access check — will throw if cross-origin AND blocked
            if (frame.contentDocument === null && frame.contentWindow === null) {
              setIframeBlocked(true);
            }
          } catch {
            // Cross-origin is expected, but iframe still loaded — that's fine
          }
        }}
      />
      {/* Fallback: if iframe shows nothing for 5 seconds, assume blocked */}
      <IframeBlockDetector onBlocked={() => setIframeBlocked(true)} />
    </div>
  );
}

/**
 * Some sites refuse to load in an iframe via X-Frame-Options or CSP
 * but don't trigger onError. This detects the empty frame fallback.
 */
function IframeBlockDetector({ onBlocked }: { onBlocked: () => void }) {
  useState(() => {
    const timer = setTimeout(() => {
      // Give the iframe 6 seconds to load — if content is still empty, fallback
      const iframe = document.querySelector('iframe');
      if (iframe) {
        try {
          const doc = iframe.contentDocument;
          if (doc && (!doc.body || doc.body.innerHTML === '')) {
            onBlocked();
          }
        } catch {
          // Cross-origin — iframe loaded but we can't read it, which is OK
        }
      }
    }, 6000);
    return () => clearTimeout(timer);
  });

  return null;
}
