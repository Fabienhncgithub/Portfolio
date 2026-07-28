import type { MetadataRoute } from "next";
import { getPhotos } from "@/lib/photos";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const photos = await getPhotos();
  const staticPages = ["", "/about", "/archive", "/contact"];

  return [
    ...staticPages.map((path) => ({
      url: absoluteUrl(path || "/"),
      changeFrequency: path ? "monthly" as const : "weekly" as const,
      priority: path ? 0.7 : 1,
    })),
    ...photos.map((photo) => ({
      url: absoluteUrl(`/photo/${encodeURIComponent(photo.slug)}`),
      ...(photo.updatedAt ? { lastModified: new Date(photo.updatedAt) } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: [photo.image],
    })),
  ];
}
