import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles output automatically - no need for standalone mode
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow images from external domains if needed
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
