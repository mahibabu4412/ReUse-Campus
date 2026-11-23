import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* The app reads live per-request auth/session data on most routes.
     Cache Components would force Suspense boundaries around every page. */
  cacheComponents: false,
  experimental: {
    serverActions: {
      // Multi-image listings can exceed the 1MB default.
      bodySizeLimit: "30mb",
    },
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
