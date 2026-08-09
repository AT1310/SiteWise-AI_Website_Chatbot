import { createContext, useContext, useState, type ReactNode } from 'react';
import type { CrawlResponse } from '../types/api';

interface WebsiteContextType {
  crawlData: CrawlResponse | null;
  setCrawlData: (data: CrawlResponse) => void;
  clearCrawlData: () => void;
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);

export function WebsiteProvider({ children }: { children: ReactNode }) {
  const [crawlData, setCrawlDataState] = useState<CrawlResponse | null>(null);

  const setCrawlData = (data: CrawlResponse) => setCrawlDataState(data);
  const clearCrawlData = () => setCrawlDataState(null);

  return (
    <WebsiteContext.Provider value={{ crawlData, setCrawlData, clearCrawlData }}>
      {children}
    </WebsiteContext.Provider>
  );
}

export function useWebsite(): WebsiteContextType {
  const context = useContext(WebsiteContext);
  if (!context) {
    throw new Error('useWebsite must be used within a WebsiteProvider');
  }
  return context;
}
