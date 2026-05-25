import type { NextConfig } from "next";

const devOrigins = process.env.REPLIT_DOMAINS
  ? process.env.REPLIT_DOMAINS.split(",").map((d) => d.trim())
  : [];

const nextConfig: NextConfig = {
  allowedDevOrigins: devOrigins,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://proptech-radar-api.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
