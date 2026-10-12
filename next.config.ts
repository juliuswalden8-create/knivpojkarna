import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site is content-managed from the admin dashboard and every public page
  // reads from the database, so the classic (request-time) rendering model is
  // used instead of Cache Components. See docs/app/guides/caching-without-cache-components.
  cacheComponents: false,
  partialPrefetching: false,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
