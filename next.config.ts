import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/combopack.png",
        destination: "/combo.jpeg",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
