/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.farcaster.xyz',
      },
      {
        protocol: 'https',
        hostname: '**.ipfs.dweb.link',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle WASM for SynSync audio engine
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },
  async headers() {
    return [
      {
        source: '/wasm/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/wasm',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
