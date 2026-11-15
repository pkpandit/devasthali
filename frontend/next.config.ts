import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

function getMediaRemotePatterns() {
  const patterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [];
  const seen = new Set<string>();

  const addPattern = (
    protocol: "http" | "https",
    hostname: string,
    port: string | undefined,
    pathname: string
  ) => {
    const key = `${protocol}://${hostname}:${port || ""}${pathname}`;
    if (!seen.has(key)) {
      seen.add(key);
      patterns.push({
        protocol,
        hostname,
        ...(port ? { port } : {}),
        pathname,
      });
    }
  };

  // Local development loopback patterns
  if (isDev) {
    addPattern("http", "127.0.0.1", "3001", "/api/public/media/toppers/**");
    addPattern("http", "localhost", "3001", "/api/public/media/toppers/**");
  }

  // Configured production media origin
  const configuredOrigin =
    process.env.NEXT_PUBLIC_MEDIA_ORIGIN ||
    process.env.PUBLIC_MEDIA_ORIGIN;

  if (configuredOrigin) {
    try {
      const parsed = new URL(configuredOrigin);
      const protocol = parsed.protocol.replace(":", "") as "http" | "https";
      if ((protocol === "http" || protocol === "https") && parsed.hostname) {
        addPattern(protocol, parsed.hostname, parsed.port || undefined, "/api/public/media/toppers/**");
      }
    } catch {
      // Ignore invalid URL
    }
  }

  return patterns;
}

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
    }),
    remotePatterns: getMediaRemotePatterns(),
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
