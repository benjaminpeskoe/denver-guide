import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/api/photo",
      },
      {
        pathname: "/photos/**",
      },
    ],
  },
};

export default nextConfig;
