/** 
 * EPWORLD Optimized Next.js Configuration
 * Performance-focused configuration with bundle optimization
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  transpilePackages: ['@epworld/shared'],
  images: {
    domains: ['ipfs.io', 'arweave.net', 'epworld.xyz'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.ipfs.io' },
      { protocol: 'https', hostname: '**.arweave.net' },
    ],
  },
  experimental: {
    optimizePackageImports: ['@farcaster/frame-sdk', 'lucide-react'],
  },
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          reactVendor: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react-vendor',
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          farcasterVendor: {
            test: /[\\/]node_modules[\\/](@farcaster)[\\/]/,
            name: 'farcaster-vendor',
            chunks: 'all',
            priority: 30,
            enforce: true,
          },
          ui: {
            test: /[\\/]src[\\/]components[\\/]/,
            name: 'ui-components',
            chunks: 'all',
            priority: 20,
            minSize: 10000,
          },
          farcaster: {
            test: /[\\/]src[\\/]farcaster[\\/]/,
            name: 'farcaster-features',
            chunks: 'all',
            priority: 15,
            minSize: 10000,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
  },
};

module.exports = nextConfig;
