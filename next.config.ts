import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Linkia config */
  serverExternalPackages: ["pdf-parse"],
  // Permitir acceso desde la red local (IP del equipo de desarrollo)
  allowedDevOrigins: ["10.100.67.14"],
};

export default nextConfig;
