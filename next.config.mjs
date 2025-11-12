/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '45.90.99.130',
      },
      {
        protocol: 'https',
        hostname: 'cdn.playadopt.me',
      },
      {
        protocol: 'https',
        hostname: 'assetdelivery.roblox.com',
      },
      {
        protocol: 'https',
        hostname: 'tr.rbxcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'c0.rbxcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'c1.rbxcdn.com',
      },
      {
        protocol: 'https',
        hostname: 't0.rbxcdn.com',
      },
      {
        protocol: 'https',
        hostname: 't1.rbxcdn.com',
      },
      {
        protocol: 'https',
        hostname: 't2.rbxcdn.com',
      },
      {
        protocol: 'https',
        hostname: 't3.rbxcdn.com',
      },
      {
        protocol: 'https',
        hostname: 't4.rbxcdn.com',
      },
      {
        protocol: 'https',
        hostname: 't5.rbxcdn.com',
      },
      {
        protocol: 'https',
        hostname: 't6.rbxcdn.com',
      },
      {
        protocol: 'https',
        hostname: 't7.rbxcdn.com',
      },
    ],
  },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

export default nextConfig
