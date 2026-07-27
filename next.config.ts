import type { NextConfig } from "next";

const strapiUrl = process.env.STRAPI_URL ?? process.env.NEXT_PUBLIC_STRAPI_URL;
const strapiMediaPattern = strapiUrl
  ? {
      protocol: new URL(strapiUrl).protocol.replace(":", "") as "http" | "https",
      hostname: new URL(strapiUrl).hostname,
      port: new URL(strapiUrl).port,
      pathname: "/uploads/**",
    }
  : undefined;

const nextConfig: NextConfig = {
  distDir: "dist",
  outputFileTracingRoot: process.cwd(),
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      ...(strapiMediaPattern ? [strapiMediaPattern] : []),
    ],
  },
};

export default nextConfig;
