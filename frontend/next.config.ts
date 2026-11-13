import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    qualities: [75, 85, 90, 95],
    ...(isDev && {
      dangerouslyAllowLocalIP: true,
      remotePatterns: [
        {
          protocol: "http",
          hostname: "127.0.0.1",
          port: "3001",
          pathname: "/api/public/media/toppers/**",
        },
        {
          protocol: "http",
          hostname: "localhost",
          port: "3001",
          pathname: "/api/public/media/toppers/**",
        },
      ],
    }),
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
  async redirects() {
    return [
      { source: "/admission.html", destination: "/admissions", permanent: true },
      { source: "/contact-us.html", destination: "/contact", permanent: true },
      { source: "/notice-board.php", destination: "/notices", permanent: true },
      { source: "/fee-structure.html", destination: "/admissions/fees", permanent: true },
      { source: "/mandatory-disclosure.html", destination: "/mandatory-public-disclosure", permanent: true },
      { source: "/about-us.html", destination: "/about", permanent: true },
    ];
  },
};

export default nextConfig;
