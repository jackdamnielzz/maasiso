/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  typescript: {
    // During production build, we'll use our more permissive config
    tsconfigPath: process.env.NODE_ENV === 'production' ? './tsconfig.prod.json' : './tsconfig.json',
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: process.env.NODE_ENV === 'production'
  },
  eslint: {
    // Only run ESLint on non-production builds
    ignoreDuringBuilds: process.env.NODE_ENV === 'production'
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '153.92.223.23',
        port: '1337',
      },
    ],
  },
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  logging: {
    level: 'error',
  },
  // Production security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  // Exclude test-related paths in production
  webpack: (config, { dev, isServer }) => {
    if (!dev && isServer) {
      config.watchOptions = {
        ignored: [
          '**/test-env/**',
          '**/tests/**',
          '**/__tests__/**',
          '**/*.test.*',
          '**/*.spec.*'
        ]
      };
    }
    return config;
  }
};

module.exports = nextConfig;
