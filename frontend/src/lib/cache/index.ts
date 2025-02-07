import { CacheManager } from './CacheManager';
import { 
  cachedFetch, 
  prefetchRequest, 
  getCacheStats, 
  clearCache, 
  cleanupCache 
} from './cachedFetch';

export { 
  CacheManager,
  cachedFetch, 
  prefetchRequest, 
  getCacheStats, 
  clearCache, 
  cleanupCache 
};

// Set up automatic cache cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupCache, 5 * 60 * 1000);
}
