export interface CacheEntry {
  data: any;
  timestamp: number;
}

export const quoteCache = new Map<string, CacheEntry>();
export const CACHE_TTL_MS = 2 * 60 * 1000;
