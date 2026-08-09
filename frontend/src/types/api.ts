export interface CrawlRequest {
  url: string;
}

export interface CrawlStats {
  pages_crawled?: number;
  documents_processed?: number;
  chunks_created?: number;
  time_taken?: number | string;
  strategy?: string;
  [key: string]: unknown;
}

export interface CrawlResponse {
  session_id?: string;
  url?: string;
  title?: string;
  strategy?: string;
  stats?: CrawlStats;
  pages_crawled?: number;
  documents_processed?: number;
  chunks_created?: number;
  time_taken?: number | string;
  content?: string;
  documents?: Array<{ url?: string; title?: string; content?: string }>;
  message?: string;
  [key: string]: unknown;
}

export interface ChatSource {
  url?: string;
  title?: string;
  snippet?: string;
  score?: number;
}

export interface ChatRequest {
  url?: string;
  session_id?: string;
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface ChatResponse {
  answer?: string;
  response?: string;
  message?: string;
  sources?: ChatSource[];
  [key: string]: unknown;
}
