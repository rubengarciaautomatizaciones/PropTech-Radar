import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Esto le dice a Vercel: "Ignora los errores de ESLint, compila y publica".
    ignoreDuringBuilds: true,
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