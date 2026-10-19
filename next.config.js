/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  turbopack: {
    root: process.cwd(),
  },
  // Mapbox CSS is loaded dynamically by the component; no extra webpack config needed.
  // The component uses 'use client' and dynamic import patterns to avoid SSR errors.
}

export default nextConfig
