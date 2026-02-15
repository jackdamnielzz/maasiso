/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
      },
      {
        protocol: 'http',
        hostname: '153.92.223.23',
        port: '1337',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '153.92.223.23',
        port: '1337',
        pathname: '/**'
      }
    ],
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 30, // Reduced from 60 to 30 seconds
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? {
          exclude: ['error', 'warn']
        }
      : false
  }
};

module.exports = nextConfig;
