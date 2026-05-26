import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/portail-client",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
