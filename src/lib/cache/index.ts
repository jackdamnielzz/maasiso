import { CacheManager } from './CacheManager';
import { 
  cachedFetch, 
  prefetchRequest,
  getCacheStats, 
  clearCache, 
  cleanupCache 
} from './cachedFetch';

// Export the simplified cache functions that now perform direct fetches without caching
export { 
  CacheManager,
  cachedFetch, 
  prefetchRequest, 
  getCacheStats, 
  clearCache, 
  cleanupCache 
};
