/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_BUILD_TIMESTAMP: new Date().toLocaleString('nl-NL', {
      timeZone: 'Europe/Amsterdam',
      dateStyle: 'full',
      timeStyle: 'long'
    })
  },
  async redirects() {
    return [
      {
        source: '/blog',
        destination: '/kennis/blog',
        permanent: true,
      },
      {
        source: '/blog/:slug',
        destination: '/kennis/blog/:slug',
        permanent: true,
      },
      {
        source: '/whitepaper',
        destination: '/kennis/whitepapers',
        permanent: true,
      },
      {
        source: '/whitepaper/:slug',
        destination: '/kennis/whitepapers/:slug',
        permanent: true,
      },
    ];
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
          exclude: ['error', 'warn', 'info', 'debug', 'log']
        }
      : false
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        cacheGroups: {
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: false // Force new chunks on build
          },
          vendors: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: false // Force new chunks on build
          }
        },
        // Ensure chunks are rebuilt on each deployment
        cacheGroups: {
          default: false,
          defaultVendors: false
        }
      };
    }

    if (isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic'
      };
    }

    return config;
  },
};

module.exports = nextConfig;
