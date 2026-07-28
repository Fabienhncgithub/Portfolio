import {
  getSessionItem,
  removeSessionItem,
  setSessionItem,
} from "@/lib/sessionStorage";

const storageKey = "gallery-return-state";
const maxAge = 30 * 60 * 1000;

export type GalleryReturnState = {
  at: number;
  scrollY: number;
  slug: string;
};

export function readGalleryReturnState() {
  const value = getSessionItem(storageKey);
  if (!value) return;

  try {
    const state: unknown = JSON.parse(value);
    if (!state || typeof state !== "object") return;

    const candidate = state as Partial<GalleryReturnState>;
    if (
      !Number.isFinite(candidate.at)
      || !Number.isFinite(candidate.scrollY)
      || typeof candidate.slug !== "string"
      || !candidate.slug
      || Date.now() - (candidate.at ?? 0) > maxAge
    ) return;

    return candidate as GalleryReturnState;
  } catch {
    return;
  }
}

export function removeGalleryReturnState() {
  removeSessionItem(storageKey);
}

export function saveGalleryReturnState(slug: string, scrollY: number) {
  setSessionItem(storageKey, JSON.stringify({
    at: Date.now(),
    scrollY,
    slug,
  } satisfies GalleryReturnState));
}

export function updateGalleryReturnSlug(slug: string) {
  const state = readGalleryReturnState();
  if (!state || state.slug === slug) return;

  setSessionItem(storageKey, JSON.stringify({
    ...state,
    at: Date.now(),
    slug,
  } satisfies GalleryReturnState));
}
