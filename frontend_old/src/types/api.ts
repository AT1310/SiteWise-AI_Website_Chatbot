/* ── API Types — mirrors backend/models exactly ───────────────────────── */

// POST /crawl request
export interface CrawlRequest {
  url: string;
}

// POST /crawl response
export interface CrawlResponse {
  status: string;
  message: string;
  website_url: string;
  website_title: string;
  collection_name: string;
  crawl_strategy: string;
  pages_crawled: number;
  documents_processed: number;
  chunks_created: number;
  time_taken: number;
}

// POST /chat request
export interface ChatRequest {
  question: string;
}

// Source inside chat response
export interface Source {
  title: string;
  url: string;
  content_type: string;
}

// POST /chat response
export interface ChatResponse {
  question: string;
  answer: string;
  confidence: number;
  sources: Source[];
  total_sources: number;
}

// GET /health response
export interface HealthResponse {
  status: string;
  message: string;
}

// ── Frontend-only types ──────────────────────────────────────────────── //

export interface ChatMessageType {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  confidence?: number;
  timestamp: Date;
  isLoading?: boolean;
}

export interface CrawlStep {
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
}
