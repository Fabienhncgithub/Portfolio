import type { Photo, PhotoCategory } from "@/types/content";

type UnknownRecord = Record<string, unknown>;

const cmsPublicUrl = process.env.STRAPI_URL?.trim();
const cmsApiUrl = process.env.STRAPI_INTERNAL_URL?.trim() || cmsPublicUrl;
const apiToken = process.env.STRAPI_API_TOKEN?.trim();
const photoCategories = new Set<PhotoCategory>(["Landscape", "City", "Travel", "Details"]);
const pageSize = 100;
const maxPages = 20;
const maxResponseBytes = 5 * 1024 * 1024;

function record(value: unknown): UnknownRecord | undefined {
  return value && typeof value === "object" ? (value as UnknownRecord) : undefined;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function positiveNumber(value: unknown) {
  const candidate = number(value);
  return candidate && candidate > 0 ? candidate : undefined;
}

function positiveInteger(value: unknown) {
  const candidate = positiveNumber(value);
  return candidate && Number.isInteger(candidate) ? candidate : undefined;
}

function boundedText(value: unknown, maxLength: number) {
  const candidate = text(value);
  return candidate && candidate.length <= maxLength ? candidate : undefined;
}

function photoCategory(value: unknown): PhotoCategory {
  const candidate = text(value) as PhotoCategory | undefined;
  return candidate && photoCategories.has(candidate) ? candidate : "Details";
}

function isoDate(value: unknown) {
  const candidate = text(value);
  return candidate && Number.isFinite(Date.parse(candidate)) ? candidate : undefined;
}

function absoluteMediaUrl(url: string) {
  if (!cmsPublicUrl) return;

  try {
    const cmsOrigin = new URL(cmsPublicUrl);
    const mediaUrl = new URL(url, cmsOrigin);
    if (mediaUrl.origin !== cmsOrigin.origin) return;
    if (!["http:", "https:"].includes(mediaUrl.protocol)) return;

    return mediaUrl.toString();
  } catch {
    return;
  }
}

function mediaAttributes(value: unknown): UnknownRecord | undefined {
  const root = record(value);
  const data = record(root?.data);
  return record(data?.attributes) ?? data ?? root;
}

async function readJsonWithLimit(response: Response) {
  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > maxResponseBytes) {
    throw new Error("Strapi response exceeded the allowed size.");
  }

  if (!response.body) return response.json();

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > maxResponseBytes) {
        await reader.cancel();
        throw new Error("Strapi response exceeded the allowed size.");
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}

function normalizePhoto(entry: unknown): Photo | undefined {
  const root = record(entry);
  const fields = record(root?.attributes) ?? root;
  const media = mediaAttributes(fields?.image);
  const imageUrl = text(media?.url);
  const absoluteImageUrl = imageUrl ? absoluteMediaUrl(imageUrl) : undefined;
  const formats = record(media?.formats);
  const gridFormat =
    record(formats?.large)
    ?? record(formats?.medium)
    ?? record(formats?.small);
  const gridImageUrl = text(gridFormat?.url);
  const absoluteGridImageUrl = gridImageUrl
    ? absoluteMediaUrl(gridImageUrl)
    : undefined;
  const slug = boundedText(fields?.slug, 120);
  const title = boundedText(fields?.title, 160);
  const year = positiveInteger(fields?.year);

  if (!fields || !absoluteImageUrl || !slug || !title || !/^[a-z0-9][a-z0-9-]*$/i.test(slug)) return;

  return {
    slug,
    title,
    alt: boundedText(media?.alternativeText, 500) ?? title,
    location: boundedText(fields.location, 160) ?? "",
    year: year && year >= 1900 && year <= 2100 ? year : undefined,
    category: photoCategory(fields.category),
    image: absoluteImageUrl,
    gridImage: absoluteGridImageUrl,
    width: positiveNumber(media?.width) ?? positiveNumber(fields.width) ?? 1600,
    height: positiveNumber(media?.height) ?? positiveNumber(fields.height) ?? 1200,
    camera: boundedText(fields.camera, 160),
    film: boundedText(fields.film, 160),
    updatedAt: isoDate(fields.updatedAt),
  };
}

async function fetchPhotoPage(page: number) {
  const photosUrl = new URL("/api/photos", cmsApiUrl);
  photosUrl.searchParams.set("populate", "image");
  photosUrl.searchParams.set("status", "published");
  photosUrl.searchParams.set("pagination[page]", String(page));
  photosUrl.searchParams.set("pagination[pageSize]", String(pageSize));
  photosUrl.searchParams.set("sort[0]", "year:desc");
  photosUrl.searchParams.set("sort[1]", "createdAt:desc");

  const response = await fetch(photosUrl, {
    headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : undefined,
    next: { revalidate: 60, tags: ["photos"] },
    redirect: "error",
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    throw new Error(`Strapi request failed (photos: ${response.status})`);
  }

  const payload = record(await readJsonWithLimit(response));
  const entries = Array.isArray(payload?.data) ? payload.data : [];
  const meta = record(payload?.meta);
  const pagination = record(meta?.pagination);
  const pageCount = positiveInteger(pagination?.pageCount) ?? 1;

  return { entries, pageCount };
}

export async function fetchStrapiPhotos(): Promise<Photo[] | undefined> {
  if (!cmsApiUrl || !cmsPublicUrl) return;

  const firstPage = await fetchPhotoPage(1);
  if (firstPage.pageCount > maxPages) {
    throw new Error(`Strapi returned more than ${maxPages * pageSize} photos.`);
  }

  const photoEntries = [...firstPage.entries];
  for (let page = 2; page <= firstPage.pageCount; page += 1) {
    const result = await fetchPhotoPage(page);
    photoEntries.push(...result.entries);
  }
  const photos = photoEntries.flatMap((entry) => {
    const photo = normalizePhoto(entry);
    return photo ? [photo] : [];
  });

  return photos;
}
