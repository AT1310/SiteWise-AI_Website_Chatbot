import axios from 'axios';
import type { CrawlResponse, ChatResponse, HealthResponse } from '../types/api';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 300000, // 5 min — crawling can be slow
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function crawlWebsite(url: string): Promise<CrawlResponse> {
  const { data } = await api.post<CrawlResponse>('/crawl', { url });
  return data;
}

export async function chatWithWebsite(question: string): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>('/chat', { question });
  return data;
}

export async function checkHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health');
  return data;
}

export default api;
