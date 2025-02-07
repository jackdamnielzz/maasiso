import type { NextConfig } from "next";
import { BundleBudgetPlugin } from "./src/config/webpack/BundleBudgetPlugin";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Security headers configuration
  async headers() {
    return [
      {
        // Apply these headers to all routes
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
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: *.google-analytics.com 153.92.223.23; font-src 'self'; connect-src 'self' *.google-analytics.com"
          }
        ]
      },
      {
        // Apply CORS headers to API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_API_URL || ''
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          }
        ]
      }
    ];
  },
  images: {
    domains: ['153.92.223.23'], // Allow images from Strapi
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
      {
        source: '/nieuws',
        destination: '/news',
      },
      {
        source: '/nieuws/:path*',
        destination: '/news/:path*',
      },
    ];
  },
  // Bundle optimization settings
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console.log in production
  },
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: ['@/components'], // Optimize specific package imports
  },
  webpack: (config, { dev, isServer }) => {
    // Enable tree shaking
    config.optimization = {
      ...config.optimization,
      usedExports: true,
    };

    // Add bundle budget plugin in production
    if (!dev && !isServer) {
      config.plugins = config.plugins || [];
      config.plugins.push(new BundleBudgetPlugin());
    }

    return config;
  },
};

// Wrap the config with bundle analyzer
export default withBundleAnalyzer(nextConfig);
