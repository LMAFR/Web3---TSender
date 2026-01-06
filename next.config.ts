import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // It will be a static site socketClientCache...
  output:"export",
  images: {
    unoptimized: true,
  },
  basePath:"",
  assetPrefix:"./",
  trailingSlash:true,
};

export default nextConfig;
