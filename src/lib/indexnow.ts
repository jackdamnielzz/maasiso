/**
 * IndexNow Implementation
 *
 * IndexNow is a protocol that allows websites to instantly notify search engines
 * about content changes. This helps search engines discover fresh content faster.
 *
 * Supported search engines:
 * - Microsoft Bing
 * - Yandex
 * - Naver
 * - Seznam.cz
 *
 * @see https://www.indexnow.org/
 */

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

// Alternative endpoints (all work the same way):
// - https://www.bing.com/indexnow
// - https://yandex.com/indexnow
// - https://api.indexnow.org/indexnow

/**
 * Submit a URL to IndexNow
 *
 * @param url - The full URL to notify (e.g., https://www.maasiso.nl/blog/my-post)
 * @param key - IndexNow API key (optional if INDEXNOW_KEY env var is set)
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function notifyIndexNow(
  url: string,
  key?: string
): Promise<boolean> {
  const apiKey = key || process.env.INDEXNOW_KEY;

  if (!apiKey) {
    console.warn('[IndexNow] API key not configured. Set INDEXNOW_KEY environment variable.');
    return false;
  }

  // Validate URL
  try {
    new URL(url);
  } catch (error) {
    console.error('[IndexNow] Invalid URL:', url);
    return false;
  }

  // Extract host from URL
  const urlObj = new URL(url);
  const host = urlObj.hostname;

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host,
        key: apiKey,
        urlList: [url],
      }),
    });

    if (response.ok || response.status === 202) {
      console.log('[IndexNow] Successfully notified:', url);
      return true;
    }

    console.error('[IndexNow] Failed to notify:', {
      url,
      status: response.status,
      statusText: response.statusText,
    });
    return false;
  } catch (error) {
    console.error('[IndexNow] Network error:', error);
    return false;
  }
}

/**
 * Submit multiple URLs to IndexNow in a single request
 *
 * @param urls - Array of full URLs to notify
 * @param key - IndexNow API key (optional if INDEXNOW_KEY env var is set)
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function notifyIndexNowBatch(
  urls: string[],
  key?: string
): Promise<boolean> {
  const apiKey = key || process.env.INDEXNOW_KEY;

  if (!apiKey) {
    console.warn('[IndexNow] API key not configured. Set INDEXNOW_KEY environment variable.');
    return false;
  }

  if (urls.length === 0) {
    console.warn('[IndexNow] No URLs provided.');
    return false;
  }

  // Limit to 10,000 URLs per request (IndexNow limit)
  const limitedUrls = urls.slice(0, 10000);

  // Extract host from first URL (all URLs must be from same host)
  const firstUrl = new URL(limitedUrls[0]);
  const host = firstUrl.hostname;

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host,
        key: apiKey,
        urlList: limitedUrls,
      }),
    });

    if (response.ok || response.status === 202) {
      console.log(`[IndexNow] Successfully notified ${limitedUrls.length} URLs`);
      return true;
    }

    console.error('[IndexNow] Batch notification failed:', {
      status: response.status,
      statusText: response.statusText,
    });
    return false;
  } catch (error) {
    console.error('[IndexNow] Batch network error:', error);
    return false;
  }
}

/**
 * Notify IndexNow about a blog post
 * Helper function specifically for blog posts
 *
 * @param slug - The blog post slug
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function notifyBlogPost(slug: string): Promise<boolean> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.maasiso.nl';
  const url = `${siteUrl}/blog/${slug}`;
  return notifyIndexNow(url);
}

/**
 * Notify IndexNow about a page
 * Helper function for any page on the site
 *
 * @param path - The page path (e.g., '/diensten' or '/iso-9001')
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function notifyPage(path: string): Promise<boolean> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.maasiso.nl';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${siteUrl}${cleanPath}`;
  return notifyIndexNow(url);
}

export default {
  notifyIndexNow,
  notifyIndexNowBatch,
  notifyBlogPost,
  notifyPage,
};
