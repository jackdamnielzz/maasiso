/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['147.93.62.187'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['147.93.62.188']
    }
  }
}

module.exports = nextConfig
