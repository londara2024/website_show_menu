import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a verification build run beside `next dev` without sharing .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Self-contained server in .next/standalone — used by the Dockerfile
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Product image uploads go through a Server Action: 5 MB image + multipart overhead.
    serverActions: { bodySizeLimit: "6mb" },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
