/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  typescript: {
    tsconfigPath: process.env.NODE_ENV === 'production' ? './tsconfig.prod.json' : './tsconfig.json',
    ignoreBuildErrors: process.env.NODE_ENV === 'production'
  },
  eslint: {
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
  async rewrites() {
    const strapiUrl = process.env.STRAPI_URL || 'http://153.92.223.23:1337';
    return {
      beforeFiles: [
        {
          source: '/api/proxy/:path*',
          destination: `${strapiUrl}/api/:path*`,
          has: [
            {
              type: 'header',
              key: 'x-skip-proxy',
              value: '(?!true)',
            },
          ],
        },
      ],
    };
  },
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
