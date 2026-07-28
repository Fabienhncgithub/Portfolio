import type { Metadata } from "next";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

const resolvedSiteUrl = new URL(
  configuredSiteUrl || "https://www.fabienhance.com",
);
if (resolvedSiteUrl.username || resolvedSiteUrl.password) {
  throw new Error("NEXT_PUBLIC_SITE_URL must not contain credentials.");
}
if (process.env.NODE_ENV === "production" && resolvedSiteUrl.protocol !== "https:") {
  throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS in production.");
}
resolvedSiteUrl.hash = "";
resolvedSiteUrl.search = "";

export const siteUrl = resolvedSiteUrl;

export const siteName = "Fabien Hance";
export const siteDescription =
  "Landscape, architecture and quiet moments photographed by Fabien Hance.";

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function pageMetadata({
  description,
  path,
  title,
}: {
  description: string;
  path: string;
  title: string;
}): Metadata {
  const socialTitle = `${title} — ${siteName}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName,
      locale: "en_GB",
      title: socialTitle,
      description,
    },
    twitter: {
      card: "summary",
      title: socialTitle,
      description,
    },
  };
}
