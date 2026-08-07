import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Image optimisation ──────────────────────────────────────────────────
  images: {
    // Serve AVIF first (50-80% smaller than JPEG), fall back to WebP
    formats: ["image/avif", "image/webp"],
    // Declare all quality values used across the codebase (required by Next.js)
    qualities: [75, 85],
    // Responsive breakpoints — covers mobile → retina desktop
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Cache optimised images for 60 days
    minimumCacheTTL: 60 * 60 * 24 * 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.designmenu.com.ng",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
    ],
  },

  // ── Compression ─────────────────────────────────────────────────────────
  compress: true,

  // ── Cache static assets for 1 year in the browser ───────────────────────
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache public images, fonts, videos for 7 days
        source: "/:path*.(jpg|jpeg|png|webp|avif|svg|gif|ico|woff2|woff|mp4|webm)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
