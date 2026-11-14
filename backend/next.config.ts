import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
    proxyClientMaxBodySize: "12mb",
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
