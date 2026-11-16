import type { NextConfig } from "next";

const strapiUrl =
  process.env.STRAPI_MEDIA_URL?.trim()
  || process.env.STRAPI_URL?.trim();

function getStrapiMediaPattern() {
  if (!strapiUrl) return;

  const url = new URL(strapiUrl);
  if (url.username || url.password) {
    throw new Error("STRAPI_URL must not contain embedded credentials.");
  }

  const isSecure = url.protocol === "https:";
  const isLocal =
    process.env.NODE_ENV === "development"
    &&
    url.protocol === "http:"
    && ["localhost", "127.0.0.1"].includes(url.hostname);

  if (!isSecure && !isLocal) {
    throw new Error("STRAPI_URL must use HTTPS outside local development.");
  }

  return {
    protocol: url.protocol.replace(":", "") as "http" | "https",
    hostname: url.hostname,
    port: url.port,
    pathname: "/uploads/**",
  };
}

const strapiMediaPattern = getStrapiMediaPattern();
const scriptSources = process.env.NODE_ENV === "development"
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com"
  : "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com";
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com",
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "object-src 'none'",
  scriptSources,
  "style-src 'self' 'unsafe-inline'",
  "worker-src 'self' blob:",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(), payment=(), usb=()" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
  async redirects() {
    return [
      // The archive page was removed; keep its indexed URL from turning into a 404.
      { source: "/archive", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
    // Strapi upload names carry a content hash, so an optimized image never goes stale.
    // The 60-second default made every visit re-encode the photographs in the background.
    minimumCacheTTL: 31_536_000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(strapiMediaPattern ? [strapiMediaPattern] : []),
    ],
  },
};

export default nextConfig;
