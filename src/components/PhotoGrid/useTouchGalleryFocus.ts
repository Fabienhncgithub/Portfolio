"use client";

import type { RefObject } from "react";
import { useEffect, useMemo } from "react";
import type { Photo } from "@/lib/photos";
import {
  COMPACT_HEADER_QUERY,
  GALLERY_TOP_THRESHOLD,
  PRECISE_POINTER_QUERY,
  SCROLL_DIRECTION_THRESHOLD,
  TOUCH_INPUT_QUERY,
  TOUCH_PREVIEW_DELAY,
} from "./constants";

type TouchGalleryFocusOptions = {
  grid: RefObject<HTMLElement>;
  gridHeader: RefObject<HTMLDivElement>;
  photos: Photo[];
  onActivePhotoChange: (photo: Photo) => void;
  onPreviewActivate: (photo: Photo) => void;
  onPreviewClear: () => void;
};

type ScrollDirection = "down" | "idle" | "up";
type HeaderMode = "navigation" | "title";

function setMobileHeader(mode?: HeaderMode) {
  if (!mode || !window.matchMedia(COMPACT_HEADER_QUERY).matches) {
    delete document.documentElement.dataset.mobileGalleryHeader;
    return;
  }

  document.documentElement.dataset.mobileGalleryHeader = mode;
}

export function useTouchGalleryFocus({
  grid,
  gridHeader,
  photos,
  onActivePhotoChange,
  onPreviewActivate,
  onPreviewClear,
}: TouchGalleryFocusOptions) {
  const photoBySlug = useMemo(
    () => new Map(photos.map((photo) => [photo.slug, photo])),
    [photos],
  );

  useEffect(() => {
    const compactLayout = window.matchMedia(COMPACT_HEADER_QUERY);
    const touchInput = window.matchMedia(TOUCH_INPUT_QUERY);
    const precisePointer = window.matchMedia(PRECISE_POINTER_QUERY);
    const visibleTiles = new Set<HTMLElement>();
    let titleFrame = 0;
    let previewTimer: ReturnType<typeof setTimeout> | undefined;
    let previousScrollY = window.scrollY;
    let accumulatedScroll = 0;
    let direction: ScrollDirection = "idle";
    let touchInteraction = compactLayout.matches || !precisePointer.matches;

    const tiles = [
      ...(grid.current?.querySelectorAll<HTMLElement>("[data-photo-slug]") ?? []),
    ];
    if (!photos.length || !tiles.length) {
      setMobileHeader("navigation");
      onPreviewClear();
      return () => setMobileHeader();
    }
    const observer = typeof IntersectionObserver === "undefined"
      ? undefined
      : new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            const tile = entry.target as HTMLElement;
            if (entry.isIntersecting) visibleTiles.add(tile);
            else visibleTiles.delete(tile);
          });
        });

    tiles.forEach((tile) => observer?.observe(tile));

    const clearPreviewTimer = () => {
      if (!previewTimer) return;
      clearTimeout(previewTimer);
      previewTimer = undefined;
    };

    const focusedPhoto = () => {
      const candidates = visibleTiles.size ? [...visibleTiles] : tiles;
      if (!candidates.length) return;

      const headerBottom = gridHeader.current?.getBoundingClientRect().bottom ?? 0;
      const viewportCenter = headerBottom + ((window.innerHeight - headerBottom) / 2);
      const visibleCandidates = (candidateTiles: HTMLElement[]) => candidateTiles
          .map((tile) => {
            const image = tile.querySelector<HTMLElement>("[data-photo-image]");
            const bounds = (image ?? tile).getBoundingClientRect();
            const visibleHeight = Math.max(
              0,
              Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, headerBottom),
            );
            const focusDistance = bounds.top <= viewportCenter && bounds.bottom >= viewportCenter
              ? 0
              : Math.min(
                  Math.abs(bounds.top - viewportCenter),
                  Math.abs(bounds.bottom - viewportCenter),
                );

            return { tile, visibleHeight, focusDistance };
          })
          .filter(({ visibleHeight }) => visibleHeight > 0);

      let visible = visibleCandidates(candidates);
      if (!visible.length && candidates !== tiles) visible = visibleCandidates(tiles);
      if (!visible.length) return;

      const focusedTile = visible.reduce((current, candidate) => {
        if (candidate.focusDistance !== current.focusDistance) {
          return candidate.focusDistance < current.focusDistance ? candidate : current;
        }
        return candidate.visibleHeight > current.visibleHeight ? candidate : current;
      });

      return photoBySlug.get(focusedTile.tile.dataset.photoSlug ?? "");
    };

    const updateTitle = () => {
      window.cancelAnimationFrame(titleFrame);
      titleFrame = window.requestAnimationFrame(() => {
        titleFrame = 0;
        const photo = focusedPhoto();
        if (photo) onActivePhotoChange(photo);
      });
    };

    const activateCenteredPhoto = () => {
      if (document.documentElement.dataset.galleryEntering === "true") return;

      const photo = focusedPhoto();
      if (!photo) return;

      onActivePhotoChange(photo);
      setMobileHeader("title");
      onPreviewActivate(photo);
    };

    const scheduleCenteredPhoto = () => {
      clearPreviewTimer();

      if (window.scrollY <= GALLERY_TOP_THRESHOLD) {
        onPreviewClear();
        setMobileHeader("navigation");
        return;
      }

      previewTimer = setTimeout(() => {
        previewTimer = undefined;
        activateCenteredPhoto();
      }, TOUCH_PREVIEW_DELAY);
    };

    const resetDirection = () => {
      previousScrollY = window.scrollY;
      accumulatedScroll = 0;
      direction = "idle";
    };

    const updateDirection = (scrollY: number) => {
      const delta = scrollY - previousScrollY;
      previousScrollY = scrollY;
      if (!delta) return direction;

      if (
        (accumulatedScroll > 0 && delta < 0)
        || (accumulatedScroll < 0 && delta > 0)
      ) {
        accumulatedScroll = delta;
      } else {
        accumulatedScroll += delta;
      }

      if (Math.abs(accumulatedScroll) >= SCROLL_DIRECTION_THRESHOLD) {
        direction = accumulatedScroll > 0 ? "down" : "up";
        accumulatedScroll = 0;
      }

      return direction;
    };

    const initializeTouchMode = () => {
      resetDirection();
      setMobileHeader("navigation");
      updateTitle();
      scheduleCenteredPhoto();
    };

    const handleScroll = () => {
      if (
        (!compactLayout.matches && (!touchInput.matches || !touchInteraction))
        || document.documentElement.dataset.galleryEntering === "true"
      ) return;

      const currentScrollY = window.scrollY;
      const stableDirection = updateDirection(currentScrollY);
      onPreviewClear();
      updateTitle();

      if (currentScrollY <= GALLERY_TOP_THRESHOLD) {
        clearPreviewTimer();
        direction = "idle";
        accumulatedScroll = 0;
        setMobileHeader("navigation");
        return;
      }

      if (!compactLayout.matches) {
        scheduleCenteredPhoto();
        return;
      }

      if (stableDirection === "down") {
        setMobileHeader("title");
        scheduleCenteredPhoto();
      } else if (stableDirection === "up") {
        clearPreviewTimer();
        setMobileHeader("navigation");
      }
    };

    const handleResize = () => {
      if (!compactLayout.matches && (!touchInput.matches || !touchInteraction)) return;

      resetDirection();
      onPreviewClear();
      setMobileHeader("navigation");
      updateTitle();
      scheduleCenteredPhoto();
    };

    const handleCapabilityChange = () => {
      clearPreviewTimer();
      onPreviewClear();
      touchInteraction =
        compactLayout.matches
        || (touchInput.matches && !precisePointer.matches);

      if (touchInteraction) initializeTouchMode();
      else setMobileHeader();
    };

    const handlePointerModality = (event: PointerEvent) => {
      const nextTouchInteraction =
        compactLayout.matches
        || !precisePointer.matches
        || event.pointerType === "touch";
      if (touchInteraction === nextTouchInteraction) return;

      touchInteraction = nextTouchInteraction;
      clearPreviewTimer();
      onPreviewClear();
      resetDirection();

      if (!touchInteraction) setMobileHeader();
    };

    const handleWheel = () => {
      if (compactLayout.matches || !touchInteraction || !precisePointer.matches) return;

      touchInteraction = false;
      clearPreviewTimer();
      onPreviewClear();
      resetDirection();
      setMobileHeader();
    };

    if ((compactLayout.matches || touchInput.matches) && touchInteraction) {
      initializeTouchMode();
    }
    else setMobileHeader();

    window.addEventListener("pointerover", handlePointerModality, {
      capture: true,
      passive: true,
    });
    window.addEventListener("pointerdown", handlePointerModality, {
      capture: true,
      passive: true,
    });
    window.addEventListener("wheel", handleWheel, { capture: true, passive: true });
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    compactLayout.addEventListener("change", handleCapabilityChange);
    touchInput.addEventListener("change", handleCapabilityChange);
    precisePointer.addEventListener("change", handleCapabilityChange);

    return () => {
      clearPreviewTimer();
      window.cancelAnimationFrame(titleFrame);
      observer?.disconnect();
      setMobileHeader();
      window.removeEventListener("pointerover", handlePointerModality, true);
      window.removeEventListener("pointerdown", handlePointerModality, true);
      window.removeEventListener("wheel", handleWheel, true);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
      compactLayout.removeEventListener("change", handleCapabilityChange);
      touchInput.removeEventListener("change", handleCapabilityChange);
      precisePointer.removeEventListener("change", handleCapabilityChange);
    };
  }, [
    grid,
    gridHeader,
    onActivePhotoChange,
    onPreviewActivate,
    onPreviewClear,
    photoBySlug,
    photos.length,
  ]);
}
