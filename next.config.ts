import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Optimised copies are kept for 31 days, so visitors rarely wait for a
    // fresh resize. Product photos don't change in place: to replace one,
    // give the new file a new name (docs/plan.md).
    minimumCacheTTL: 2678400,
    formats: ["image/avif", "image/webp"],
    // 75 is the default; 90 is for the full-width home hero, where softness shows.
    qualities: [75, 90],
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
