import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fra.cloud.appwrite.io",
        port: "",
        pathname: "/v1/storage/**",
      },
      {
        protocol: "https",
        hostname: "nyc.cloud.appwrite.io",
        port: "",
        pathname: "/v1/storage/**",
      },
      {
        protocol: "https",
        hostname: "syd.cloud.appwrite.io",
        port: "",
        pathname: "/v1/storage/**",
      },
      {
        protocol: "https",
        hostname: "sfo.cloud.appwrite.io",
        port: "",
        pathname: "/v1/storage/**",
      },
    ],
  }
};

export default nextConfig;
