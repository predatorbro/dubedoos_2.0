import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/s2/favicons/**", // allow favicons
      },
    ],
  },
};

export default nextConfig;