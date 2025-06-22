import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure image domains for Next.js Image optimization
  images: {
    domains: ['coin-images.coingecko.com'],
    minimumCacheTTL: 3600, // 1 hour cache for images
  },

  // API route rewrites to handle CORS with CoinGecko API
  async rewrites() {
    return [
      {
        source: '/api/coingecko/:path*',
        destination: 'https://api.coingecko.com/api/v3/:path*'
      }
    ]
  },

  // Enable React Strict Mode for better development warnings
  reactStrictMode: true,

  // Add headers to API routes to help with CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },

  // Enable experimental features if needed
  experimental: {
    optimizeCss: true, // Enable CSS optimization if supported
    serverActions: { bodySizeLimit: '1mb', allowedOrigins: ['*'] }, // Configure server actions with valid properties
  },

  // Configure webpack if needed
  webpack: (config) => {
    // Add custom webpack configurations here if needed
    return config;
  },
};

export default nextConfig;