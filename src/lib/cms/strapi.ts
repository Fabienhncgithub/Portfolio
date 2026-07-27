import type { Photo, PhotoCategory } from "@/types/content";

type UnknownRecord = Record<string, unknown>;

const cmsUrl = process.env.STRAPI_URL ?? process.env.NEXT_PUBLIC_STRAPI_URL;

function record(value: unknown): UnknownRecord | undefined {
  return value && typeof value === "object" ? (value as UnknownRecord) : undefined;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function absoluteMediaUrl(url: string) {
  if (/^https?:\/\//.test(url)) return url;
  return cmsUrl ? new URL(url, cmsUrl).toString() : url;
}

function mediaAttributes(value: unknown): UnknownRecord | undefined {
  const root = record(value);
  const data = record(root?.data);
  return record(data?.attributes) ?? data ?? root;
}

function normalizePhoto(entry: unknown): Photo | undefined {
  const root = record(entry);
  const fields = record(root?.attributes) ?? root;
  const media = mediaAttributes(fields?.image);
  const imageUrl = text(media?.url);
  const slug = text(fields?.slug);
  const title = text(fields?.title);

  if (!fields || !imageUrl || !slug || !title) return;

  return {
    slug,
    title,
    location: text(fields.location) ?? "",
    year: number(fields.year) ?? new Date().getFullYear(),
    category: (text(fields.category) ?? "Details") as PhotoCategory,
    image: absoluteMediaUrl(imageUrl),
    width: number(media?.width) ?? number(fields.width) ?? 1600,
    height: number(media?.height) ?? number(fields.height) ?? 1200,
    camera: text(fields.camera),
    film: text(fields.film),
  };
}

function normalizeMedia(entry: unknown): Photo | undefined {
  const media = record(entry);
  if (!media) return;

  const url = text(media?.url);
  const name = text(media?.name);
  const id = text(media?.documentId) ?? String(media?.id ?? "");

  if (!url || !name || !id || !text(media?.mime)?.startsWith("image/")) return;

  const createdAt = text(media.createdAt);
  const mediaTitle = text(media.title)
    ?? text(media.alternativeText)
    ?? text(media.caption)
    ?? name.replace(/\.[^.]+$/, "");

  return {
    slug: `media-${id}`,
    title: mediaTitle,
    location: "",
    year: createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear(),
    category: "Details",
    image: absoluteMediaUrl(url),
    width: number(media.width) ?? 1600,
    height: number(media.height) ?? 1200,
  };
}

export async function fetchStrapiPhotos(): Promise<Photo[] | undefined> {
  if (!cmsUrl) return;

  const photosUrl = new URL("/api/photos", cmsUrl);
  photosUrl.searchParams.set("populate", "image");
  photosUrl.searchParams.set("sort[0]", "year:desc");
  photosUrl.searchParams.set("sort[1]", "createdAt:desc");

  const mediaUrl = new URL("/api/upload/files", cmsUrl);
  mediaUrl.searchParams.set("sort", "createdAt:desc");
  mediaUrl.searchParams.set("pagination[pageSize]", "100");

  const request = (url: URL) =>
    fetch(url, {
      headers: process.env.STRAPI_API_TOKEN
        ? { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` }
        : undefined,
      next: { revalidate: 60, tags: ["photos"] },
    });

  const [photosResponse, mediaResponse] = await Promise.all([
    request(photosUrl),
    request(mediaUrl),
  ]);

  if (!photosResponse.ok || !mediaResponse.ok) {
    throw new Error(
      `Strapi request failed (photos: ${photosResponse.status}, media: ${mediaResponse.status})`,
    );
  }

  const photosPayload = record(await photosResponse.json());
  const photoEntries = Array.isArray(photosPayload?.data) ? photosPayload.data : [];
  const photos = photoEntries.flatMap((entry) => {
    const photo = normalizePhoto(entry);
    return photo ? [photo] : [];
  });

  const mediaPayload = await mediaResponse.json();
  const mediaEntries = Array.isArray(mediaPayload) ? mediaPayload : [];
  const usedImages = new Set(photos.map((photo) => photo.image));
  const orphanMedia = mediaEntries.flatMap((entry) => {
    const photo = normalizeMedia(entry);
    return photo && !usedImages.has(photo.image) ? [photo] : [];
  });

  const portfolio = [...photos, ...orphanMedia];
  return portfolio.length ? portfolio : undefined;
}
