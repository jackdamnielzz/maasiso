/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Eén consistent URL-beleid: overal trailing slash, conform middleware en sitemap.
  // Next past dit ook toe op resolved canonicals/og:urls in de metadata.
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  env: {
    NEXT_PUBLIC_BUILD_TIMESTAMP: new Date().toLocaleString('nl-NL', {
      timeZone: 'Europe/Amsterdam',
      dateStyle: 'full',
      timeStyle: 'long'
    })
  },
  // Enable Turbopack for Next.js 16+
  turbopack: {},
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react']
  },
  // Cache and revalidation settings
  staticPageGenerationTimeout: 120,
  serverExternalPackages: ['sharp'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'peaceful-insight-production.up.railway.app',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**'
      }
    ],
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 1 dag — bij 30s hertransformeerde de optimizer continu
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? {
          exclude: ['error', 'warn']
        }
      : false
  },
  async headers() {
    return [
      {
        source: '/kennis/blog',
        headers: [
          {
            key: 'CDN-Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  }
};

module.exports = nextConfig;
