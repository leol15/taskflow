import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/taskflow",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
