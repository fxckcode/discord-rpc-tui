import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for development
  reactStrictMode: true,

  // Compression for production builds
  compress: true,

  // Image optimization configuration
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 1080, 1200, 1920],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },

  // Experimental features
  experimental: {
    // Optimize CSS in production (inline critical CSS)
    optimizeCss: false, // false by default — enable only if you add a CSS optimizer
    // Optimize server React payloads
    optimizeServerReact: true,
    // Enable React compiler if available in React 19
    reactCompiler: false,
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },

  // Enable Turbopack for dev (already configured in package.json scripts)
  // Disable telemetry
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
