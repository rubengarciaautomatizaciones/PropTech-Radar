import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Cualquier petición del frontend hacia /api/...
        source: "/api/:path*",
        // Se redirige en secreto a tu servidor de Render
        destination: "https://proptech-radar-api.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;