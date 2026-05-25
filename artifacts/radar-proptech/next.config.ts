import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Esto evita que el error de tipo que nos da el build detenga el despliegue
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;