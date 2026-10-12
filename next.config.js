/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Mapbox CSS is loaded dynamically by the component; no extra webpack config needed.
  // The component uses 'use client' and dynamic import patterns to avoid SSR errors.
}

export default nextConfig
