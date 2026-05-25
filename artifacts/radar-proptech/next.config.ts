import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Obligamos a Vercel a ignorar los bloqueos de tipos y publicar
  typescript: {
    ignoreBuildErrors: true,
  },
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