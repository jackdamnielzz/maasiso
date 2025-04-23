import { MetadataRoute } from 'next';

// Mock the global fetch function
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock console methods to prevent test output pollution and allow assertions
global.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
};

// Preserve original environment variables
const originalEnv = process.env;

const MOCK_BASE_URL = 'https://maasiso.nl';
const MOCK_STRAPI_URL = 'http://mock-strapi:1337';

const mockNewsData = {
    data: [
        { id: 1, title: 'News 1', slug: 'news-1', publishedAt: '2024-01-01T00:00:00.000Z' },
        { id: 2, title: 'News 2', slug: 'news-2', publishedAt: '2024-01-02T00:00:00.000Z' },
    ]
};

const mockBlogData = {
    data: [
        { id: 1, title: 'Blog 1', slug: 'blog-1', publishedAt: '2024-02-01T00:00:00.000Z' },
        { id: 2, title: 'Blog 2', slug: 'blog-2', publishedAt: '2024-02-02T00:00:00.000Z' },
    ]
};

describe('sitemap', () => {
    let sitemapModule: () => Promise<MetadataRoute.Sitemap>;

    beforeEach(async () => {
        jest.resetModules(); // Clear module cache
        mockFetch.mockClear();
        (global.console.warn as jest.Mock).mockClear();
        (global.console.error as jest.Mock).mockClear();
        process.env = { ...originalEnv };
        sitemapModule = (await import('../sitemap')).default;

        // Default fetch mock returns empty data
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: [] }),
        });
    });

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
        global.console = console;
    });

    test('includes all static routes', async () => {
        const result = await sitemapModule();
        const staticUrls = [
            '', '/over-ons', '/diensten', '/contact', '/blog', '/news',
            '/onze-voordelen', '/privacy-policy', '/terms-and-conditions',
            '/whitepaper', '/iso-9001', '/iso-14001', '/iso-27001', '/iso-16175',
            '/avg', '/bio', '/cookie-policy', '/search'
        ].map(route => `${MOCK_BASE_URL}${route}`);

        staticUrls.forEach(url => {
            expect(result.some(item => item.url === url)).toBe(true);
        });

        expect(result[0].lastModified).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test('includes dynamic news and blog routes with mock data', async () => {
        mockFetch
            .mockResolvedValueOnce({ ok: true, json: async () => mockNewsData })
            .mockResolvedValueOnce({ ok: true, json: async () => mockBlogData });

        const result = await sitemapModule();

        // News routes
        expect(result.some(item => item.url === `${MOCK_BASE_URL}/news/news-1`)).toBe(true);
        expect(result.find(item => item.url === `${MOCK_BASE_URL}/news/news-1`)?.lastModified).toBe('2024-01-01T00:00:00.000Z');
        expect(result.some(item => item.url === `${MOCK_BASE_URL}/news/news-2`)).toBe(true);

        // Blog routes
        expect(result.some(item => item.url === `${MOCK_BASE_URL}/blog/blog-1`)).toBe(true);
        expect(result.find(item => item.url === `${MOCK_BASE_URL}/blog/blog-1`)?.lastModified).toBe('2024-02-01T00:00:00.000Z');
        expect(result.some(item => item.url === `${MOCK_BASE_URL}/blog/blog-2`)).toBe(true);

        const expectedStaticCount = 18;
        expect(result.length).toBe(expectedStaticCount + mockNewsData.data.length + mockBlogData.data.length);
    });

    test('handles empty API response data gracefully', async () => {
        mockFetch.mockResolvedValue({ ok: true, json: async () => ({ data: [] }) });

        const result = await sitemapModule();

        expect(result.some(item => item.url.includes('/news/'))).toBe(false);
        expect(result.some(item => item.url.includes('/blog/'))).toBe(false);

        const expectedStaticCount = 18;
        expect(result.length).toBe(expectedStaticCount);
    });

    test('handles null API response data gracefully', async () => {
        mockFetch.mockResolvedValue({ ok: true, json: async () => null });

        const result = await sitemapModule();

        expect(global.console.error).toHaveBeenCalledWith('Could not fetch news articles after retries. Sitemap will not include news.');
        expect(global.console.error).toHaveBeenCalledWith('Could not fetch blog posts after retries. Sitemap will not include blog posts.');

        expect(result.some(item => item.url.includes('/news/'))).toBe(false);
        expect(result.some(item => item.url.includes('/blog/'))).toBe(false);

        const expectedStaticCount = 18;
        expect(result.length).toBe(expectedStaticCount);
    });

    test('uses STRAPI_API_URL environment variable if set', async () => {
        process.env.STRAPI_API_URL = MOCK_STRAPI_URL;
        mockFetch.mockResolvedValue({ ok: true, json: async () => ({ data: [] }) });

        await sitemapModule();

        // Assert fetch calls include the environment variable URL
        expect(mockFetch).toHaveBeenCalled();
        const fetchCalls = mockFetch.mock.calls.map(call => call[0]);
        fetchCalls.forEach(url => {
            expect(url).toContain(MOCK_STRAPI_URL);
        });
        expect(fetchCalls).toEqual(
            expect.arrayContaining([
                expect.stringContaining(`${MOCK_STRAPI_URL}/api/news-articles`),
                expect.stringContaining(`${MOCK_STRAPI_URL}/api/blog-posts`)
            ])
        );
    });

    test('uses default Strapi URL if environment variable is not set', async () => {
        process.env.STRAPI_API_URL = undefined;
        mockFetch.mockResolvedValue({ ok: true, json: async () => ({ data: [] }) });

        await sitemapModule();

        expect(mockFetch).toHaveBeenCalledWith(`http://localhost:1337/api/news-articles`);
        expect(mockFetch).toHaveBeenCalledWith(`http://localhost:1337/api/blog-posts`);
    });

    test('logs error and returns only static routes if fetch fails', async () => {
        mockFetch.mockRejectedValue(new Error('Network Error'));

        const result = await sitemapModule();

        expect(global.console.error).toHaveBeenCalledWith(expect.stringContaining('Could not fetch news articles after retries. Sitemap will not include news.'));
        expect(global.console.error).toHaveBeenCalledWith(expect.stringContaining('Could not fetch blog posts after retries. Sitemap will not include blog posts.'));

        const expectedStaticCount = 18;
        expect(result.length).toBe(expectedStaticCount);
        expect(result.some(item => item.url.includes('/news/'))).toBe(false);
        expect(result.some(item => item.url.includes('/blog/'))).toBe(false);
    }, 20000);
});