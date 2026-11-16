import { beforeAll, describe, expect, it, vi } from "vitest";

type NormalizePhoto = typeof import("./strapi").normalizePhoto;

const cmsUrl = "https://cms.example.com";
let normalizePhoto: NormalizePhoto;

// strapi.ts reads its configuration at import time, so the module is loaded after stubbing.
beforeAll(async () => {
  vi.stubEnv("STRAPI_URL", cmsUrl);
  vi.stubEnv("STRAPI_INTERNAL_URL", "");
  ({ normalizePhoto } = await import("./strapi"));
});

function entry(overrides: Record<string, unknown> = {}) {
  return {
    slug: "quiet-morning",
    title: "Quiet morning",
    location: "Lac Léman",
    year: 2025,
    category: "Landscape",
    camera: "Leica M6",
    film: "Portra 400",
    updatedAt: "2025-06-01T10:00:00.000Z",
    image: {
      url: "/uploads/quiet.jpg",
      alternativeText: "A quiet road",
      width: 3000,
      height: 2000,
      formats: {
        large: { url: "/uploads/large_quiet.jpg", width: 1000, height: 667 },
        small: { url: "/uploads/small_quiet.jpg", width: 500, height: 333 },
      },
    },
    ...overrides,
  };
}

describe("normalizePhoto", () => {
  it("maps a flat Strapi 5 entry", () => {
    expect(normalizePhoto(entry())).toEqual({
      slug: "quiet-morning",
      title: "Quiet morning",
      alt: "A quiet road",
      location: "Lac Léman",
      year: 2025,
      category: "Landscape",
      image: `${cmsUrl}/uploads/quiet.jpg`,
      gridImage: `${cmsUrl}/uploads/large_quiet.jpg`,
      gridImageWidth: 1000,
      gridImageHeight: 667,
      width: 3000,
      height: 2000,
      camera: "Leica M6",
      film: "Portra 400",
      updatedAt: "2025-06-01T10:00:00.000Z",
    });
  });

  it("maps a nested Strapi 4 entry", () => {
    const { image, ...fields } = entry();
    const photo = normalizePhoto({
      id: 1,
      attributes: { ...fields, image: { data: { attributes: image } } },
    });

    expect(photo?.slug).toBe("quiet-morning");
    expect(photo?.image).toBe(`${cmsUrl}/uploads/quiet.jpg`);
    expect(photo?.width).toBe(3000);
  });

  it("falls back to smaller formats, then to no grid image", () => {
    const image = entry().image;
    const smallOnly = normalizePhoto(entry({
      image: { ...image, formats: { small: image.formats.small } },
    }));
    const noFormats = normalizePhoto(entry({ image: { ...image, formats: null } }));

    expect(smallOnly?.gridImage).toBe(`${cmsUrl}/uploads/small_quiet.jpg`);
    expect(noFormats?.gridImage).toBeUndefined();
    expect(noFormats?.gridImageWidth).toBeUndefined();
  });

  it("rejects entries without a usable image, slug or title", () => {
    expect(normalizePhoto(null)).toBeUndefined();
    expect(normalizePhoto(entry({ image: null }))).toBeUndefined();
    expect(normalizePhoto(entry({ slug: "" }))).toBeUndefined();
    expect(normalizePhoto(entry({ slug: "../admin" }))).toBeUndefined();
    expect(normalizePhoto(entry({ slug: "a".repeat(121) }))).toBeUndefined();
    expect(normalizePhoto(entry({ title: "   " }))).toBeUndefined();
  });

  it("rejects media hosted outside the CMS origin", () => {
    const image = entry().image;
    const foreign = normalizePhoto(entry({
      image: { ...image, url: "https://evil.example.com/uploads/quiet.jpg" },
    }));
    const foreignGrid = normalizePhoto(entry({
      image: {
        ...image,
        formats: { large: { url: "https://evil.example.com/large.jpg" } },
      },
    }));

    expect(foreign).toBeUndefined();
    expect(foreignGrid?.image).toBe(`${cmsUrl}/uploads/quiet.jpg`);
    expect(foreignGrid?.gridImage).toBeUndefined();
  });

  it("applies defaults for optional or invalid fields", () => {
    const image = entry().image;
    const photo = normalizePhoto(entry({
      category: "Portraits",
      location: undefined,
      year: 1492,
      camera: 42,
      film: "",
      updatedAt: "not a date",
      image: { url: image.url },
    }));

    expect(photo).toMatchObject({
      alt: "Quiet morning",
      category: "Details",
      location: "",
      width: 1600,
      height: 1200,
    });
    expect(photo?.year).toBeUndefined();
    expect(photo?.camera).toBeUndefined();
    expect(photo?.film).toBeUndefined();
    expect(photo?.updatedAt).toBeUndefined();
  });
});
