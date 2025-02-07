/**
 * Utility function to prefetch data in the background
 * This helps optimize performance by loading data before it's needed
 * 
 * @param fetchFn - Async function that fetches the data
 * @returns Promise that resolves when prefetch is complete
 */
export async function prefetch<T>(fetchFn: () => Promise<T>): Promise<void> {
  try {
    // Execute the fetch function but don't return the result
    // We only want to cache the data for future use
    await fetchFn();
  } catch (error) {
    // Silently handle prefetch errors
    // We don't want prefetch failures to affect the UI
    console.debug('Prefetch failed:', error);
  }
}
