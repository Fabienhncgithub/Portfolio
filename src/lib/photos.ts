import { cache } from "react";
import { fallbackPhotos } from "@/content/photos";
import { fetchStrapiPhotos } from "@/lib/cms/strapi";

export type { Photo, PhotoCategory } from "@/types/content";

const cmsRequired = process.env.CMS_REQUIRED === "true";
const cmsUrlConfigured = Boolean(process.env.STRAPI_URL?.trim());
const cmsTokenConfigured = Boolean(process.env.STRAPI_API_TOKEN?.trim());

export const getPhotos = cache(async () => {
  if (cmsRequired && !cmsUrlConfigured) {
    throw new Error("CMS_REQUIRED is enabled but STRAPI_URL is not configured.");
  }
  if (cmsRequired && !cmsTokenConfigured) {
    throw new Error("CMS_REQUIRED is enabled but STRAPI_API_TOKEN is not configured.");
  }

  try {
    return (await fetchStrapiPhotos()) ?? fallbackPhotos;
  } catch (error) {
    if (cmsRequired) throw error;

    if (process.env.NODE_ENV !== "test") {
      console.warn("Strapi unavailable; using local fallback content.", error);
    }

    return fallbackPhotos;
  }
});

export async function getPhoto(slug: string) {
  const photos = await getPhotos();
  return photos.find((photo) => photo.slug === slug);
}
