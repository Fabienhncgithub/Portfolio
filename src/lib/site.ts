const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteUrl = new URL(
  configuredSiteUrl || "https://fabienhance.com",
);

export const siteName = "Fabien Hance";
export const siteDescription =
  "Photographies de paysages, d’architecture et de moments silencieux par Fabien Hance.";

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}
