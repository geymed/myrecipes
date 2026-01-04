import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for serverless deployment
  serverExternalPackages: ["adm-zip"],
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
