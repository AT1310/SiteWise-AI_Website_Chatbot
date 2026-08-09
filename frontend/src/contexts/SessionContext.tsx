import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CrawlResponse } from "../types/api";

export interface WebsiteSession {
  url: string;
  title?: string;
  strategy?: string;
  stats?: {
    pages_crawled?: number;
    documents_processed?: number;
    chunks_created?: number;
    time_taken?: number | string;
  };
  session_id?: string;
  content?: string;
  createdAt: number;
}

interface SessionContextValue {
  session: WebsiteSession | null;
  setSessionFromCrawl: (url: string, resp: CrawlResponse) => WebsiteSession;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);
const STORAGE_KEY = "sitewise:session";

function readStored(): WebsiteSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WebsiteSession) : null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<WebsiteSession | null>(null);

  // Hydrate after mount to avoid SSR mismatch
  useEffect(() => {
    const stored = readStored();
    if (stored) setSession(stored);
  }, []);

  const setSessionFromCrawl = useCallback((url: string, resp: CrawlResponse) => {
    const s: WebsiteSession = {
      url,
      title: resp.title,
      strategy: resp.strategy ?? resp.stats?.strategy,
      session_id: resp.session_id,
      content: resp.content,
      stats: {
        pages_crawled: (resp.stats?.pages_crawled ?? resp.pages_crawled) as number | undefined,
        documents_processed: (resp.stats?.documents_processed ?? resp.documents_processed) as number | undefined,
        chunks_created: (resp.stats?.chunks_created ?? resp.chunks_created) as number | undefined,
        time_taken: (resp.stats?.time_taken ?? resp.time_taken) as number | string | undefined,
      },
      createdAt: Date.now(),
    };
    setSession(s);
    if (typeof window !== "undefined") {
      try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
    }
    return s;
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    if (typeof window !== "undefined") {
      try { window.sessionStorage.removeItem(STORAGE_KEY); } catch {}
    }
  }, []);

  const value = useMemo(
    () => ({ session, setSessionFromCrawl, clearSession }),
    [session, setSessionFromCrawl, clearSession],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
