import { api } from "./api";
import type { CrawlRequest, CrawlResponse } from "../types/api";

export async function crawlWebsite(req: CrawlRequest): Promise<CrawlResponse> {
  const { data } = await api.post<CrawlResponse>("/crawl", req);
  return data;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const { status } = await api.get("/health", { timeout: 5000 });
    return status >= 200 && status < 300;
  } catch {
    return false;
  }
}
