import { fallbackPhotos } from "@/content/photos";
import { fetchStrapiPhotos } from "@/lib/cms/strapi";

export type { Photo, PhotoCategory } from "@/types/content";

export async function getPhotos() {
  try {
    return (await fetchStrapiPhotos()) ?? fallbackPhotos;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Strapi indisponible, utilisation du contenu local.", error);
    }
    return fallbackPhotos;
  }
}

export async function getPhoto(slug: string) {
  const photos = await getPhotos();
  return photos.find((photo) => photo.slug === slug);
}
