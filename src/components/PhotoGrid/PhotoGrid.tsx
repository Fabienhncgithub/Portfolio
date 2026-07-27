"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { InstagramLink } from "@/components/InstagramLink/InstagramLink";
import { PhotoTile } from "@/components/PhotoTile/PhotoTile";
import type { Photo } from "@/lib/photos";
import styles from "./PhotoGrid.module.scss";

const colorCache = new WeakMap<HTMLImageElement, string>();
const precisePointerQuery = "(any-hover: hover) and (any-pointer: fine)";
const touchOnlyQuery = "(any-hover: none), (any-pointer: coarse) and (any-hover: none)";

function dominantColor(image: HTMLImageElement) {
  const cached = colorCache.get(image);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return;

  canvas.width = 24;
  canvas.height = 24;

  try {
    context.drawImage(image, 0, 0, 24, 24);
    const pixels = context.getImageData(0, 0, 24, 24).data;
    const buckets = new Map<string, { count: number; red: number; green: number; blue: number }>();

    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index + 3] < 180) continue;
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const brightness = (red + green + blue) / 3;
      if (brightness < 18 || brightness > 242) continue;

      const key = `${red >> 5}-${green >> 5}-${blue >> 5}`;
      const bucket = buckets.get(key) ?? { count: 0, red: 0, green: 0, blue: 0 };
      bucket.count += 1;
      bucket.red += red;
      bucket.green += green;
      bucket.blue += blue;
      buckets.set(key, bucket);
    }

    const mostUsed = [...buckets.values()].sort((a, b) => b.count - a.count)[0];
    if (!mostUsed) return;
    const color = `rgb(${Math.round(mostUsed.red / mostUsed.count)} ${Math.round(mostUsed.green / mostUsed.count)} ${Math.round(mostUsed.blue / mostUsed.count)})`;
    colorCache.set(image, color);
    return color;
  } catch {
    return;
  }
}

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const grid = useRef<HTMLElement>(null);
  const gridMeta = useRef<HTMLDivElement>(null);
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activeSlug = useRef("");
  const endPreviewRef = useRef<() => void>(() => undefined);
  const pointerPosition = useRef<{ x: number; y: number } | undefined>(undefined);
  const syncPreviewRef = useRef<() => void>(() => undefined);
  const [activePhoto, setActivePhoto] = useState<Photo>(photos[0]);

  function resetColor() {
    if (dwellTimer.current) {
      clearTimeout(dwellTimer.current);
      dwellTimer.current = undefined;
    }
    const layers = grid.current?.querySelectorAll("[data-photo-color-layer]");

    if (layers) {
      const layerElements = [...layers];
      const touchLayout = window.matchMedia(touchOnlyQuery).matches;
      gsap.killTweensOf(layerElements);
      gsap.to(layerElements, {
        autoAlpha: 0,
        duration: touchLayout ? 0.45 : 0.75,
        ease: "power3.out",
        stagger: touchLayout ? 0 : { each: 0.025, from: "random" },
        overwrite: true,
      });
    }
  }

  function revealColorBlocks(photo: Photo) {
    const mutedLayers: Array<{ color: string; layer: Element }> = [];
    const touchLayout = window.matchMedia(touchOnlyQuery).matches;

    grid.current?.querySelectorAll<HTMLElement>("[data-photo-slug]").forEach((tile) => {
      const layer = tile.querySelector("[data-photo-color-layer]");
      const tileImage = tile.querySelector<HTMLImageElement>("[data-photo-image]");
      const isActive = tile.dataset.photoSlug === photo.slug;

      if (layer && tileImage && !isActive) {
        const color = dominantColor(tileImage);
        if (color) mutedLayers.push({ color, layer });
      }
    });

    gsap.set(
      mutedLayers.map(({ layer }) => layer),
      {
        backgroundColor: (index) => mutedLayers[index].color,
      },
    );

    gsap.to(mutedLayers.map(({ layer }) => layer), {
      autoAlpha: 1,
      duration: touchLayout ? 0.45 : 0.75,
      ease: touchLayout ? "power3.out" : "power2.inOut",
      stagger: touchLayout ? 0 : { each: 0.018, from: "random" },
      overwrite: true,
    });
  }

  function scheduleColorBlocks(photo: Photo, delay: number) {
    activeSlug.current = photo.slug;
    dwellTimer.current = setTimeout(() => {
      dwellTimer.current = undefined;
      if (activeSlug.current !== photo.slug) return;
      revealColorBlocks(photo);
    }, delay);
  }

  function preview(photo: Photo) {
    if (!window.matchMedia(precisePointerQuery).matches) {
      setActivePhoto(photo);
      return;
    }

    if (activeSlug.current === photo.slug) return;
    resetColor();
    activeSlug.current = photo.slug;
    setActivePhoto(photo);

    requestAnimationFrame(() => {
      if (!gridMeta.current) return;
      gsap.fromTo(
        gridMeta.current,
        { autoAlpha: 0, y: 5 },
        { autoAlpha: 1, y: 0, duration: 0.28, ease: "power3.out", overwrite: true },
      );
    });

    scheduleColorBlocks(photo, 1550);
  }

  function endPreview() {
    if (!window.matchMedia(precisePointerQuery).matches) return;
    if (!activeSlug.current && !dwellTimer.current) return;
    activeSlug.current = "";
    resetColor();
    if (gridMeta.current) {
      gsap.to(gridMeta.current, {
        autoAlpha: 0,
        y: -4,
        duration: 0.18,
        ease: "power2.out",
        overwrite: true,
      });
    }
  }

  function syncPreviewAtPointer() {
    const position = pointerPosition.current;
    if (!position || !grid.current) {
      endPreview();
      return;
    }

    const target = document.elementFromPoint(position.x, position.y);
    const tile = target?.closest<HTMLElement>("[data-photo-slug]");
    const slug = tile?.dataset.photoSlug;
    const photo = photos.find((item) => item.slug === slug);

    if (tile && grid.current.contains(tile) && photo) preview(photo);
    else endPreview();
  }

  endPreviewRef.current = endPreview;
  syncPreviewRef.current = syncPreviewAtPointer;

  useEffect(() => {
    let syncFrame = 0;
    let scrollTimer: ReturnType<typeof setTimeout> | undefined;

    const rememberPointer = (event: PointerEvent | WheelEvent) => {
      pointerPosition.current = { x: event.clientX, y: event.clientY };
    };

    const syncAfterLayout = () => {
      window.cancelAnimationFrame(syncFrame);
      syncFrame = window.requestAnimationFrame(() => {
        syncFrame = window.requestAnimationFrame(() => syncPreviewRef.current());
      });
    };

    const resetDuringScroll = () => {
      endPreviewRef.current();
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(syncAfterLayout, 140);
    };

    const leaveViewport = () => {
      pointerPosition.current = undefined;
      endPreviewRef.current();
    };

    const suspendPreview = () => endPreviewRef.current();

    window.addEventListener("pointermove", rememberPointer, { passive: true });
    window.addEventListener("pointerover", rememberPointer, { passive: true });
    window.addEventListener("pointerdown", rememberPointer, { passive: true });
    window.addEventListener("wheel", rememberPointer, { passive: true });
    window.addEventListener("scroll", resetDuringScroll, { capture: true, passive: true });
    window.addEventListener("scrollend", syncAfterLayout, { passive: true });
    window.addEventListener("focus", syncAfterLayout);
    window.addEventListener("blur", suspendPreview);
    document.documentElement.addEventListener("pointerleave", leaveViewport);

    return () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      window.cancelAnimationFrame(syncFrame);
      window.removeEventListener("pointermove", rememberPointer);
      window.removeEventListener("pointerover", rememberPointer);
      window.removeEventListener("pointerdown", rememberPointer);
      window.removeEventListener("wheel", rememberPointer);
      window.removeEventListener("scroll", resetDuringScroll, true);
      window.removeEventListener("scrollend", syncAfterLayout);
      window.removeEventListener("focus", syncAfterLayout);
      window.removeEventListener("blur", suspendPreview);
      document.documentElement.removeEventListener("pointerleave", leaveViewport);
    };
  }, []);

  useEffect(() => {
    const touchLayout = window.matchMedia(touchOnlyQuery);
    if (!touchLayout.matches) return;

    const photoBySlug = new Map(photos.map((photo) => [photo.slug, photo]));
    let frame = 0;
    let centeredPhotoTimer: ReturnType<typeof setTimeout> | undefined;
    let previousScrollY = window.scrollY;

    const setMobileHeader = (mode: "navigation" | "title") => {
      if (window.innerWidth >= 768) {
        delete document.documentElement.dataset.mobileGalleryHeader;
        return;
      }

      document.documentElement.dataset.mobileGalleryHeader = mode;
    };

    const getFocusedPhoto = () => {
      const tiles = [...(grid.current?.querySelectorAll<HTMLElement>("[data-photo-slug]") ?? [])];
      if (!tiles.length) return;

      const titleBandBottom = window.innerWidth < 768
        ? 48
        : window.innerWidth < 1024
          ? 116
          : 44;
      const viewportCenter = titleBandBottom + ((window.innerHeight - titleBandBottom) / 2);
      const visibleTiles = tiles
        .map((tile) => {
          const image = tile.querySelector<HTMLElement>("[data-photo-image]");
          const bounds = (image ?? tile).getBoundingClientRect();
          const visibleHeight = Math.max(
            0,
            Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, titleBandBottom),
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

      if (!visibleTiles.length) return;

      const focusedTile = visibleTiles.reduce((current, candidate) => {
        if (candidate.focusDistance !== current.focusDistance) {
          return candidate.focusDistance < current.focusDistance ? candidate : current;
        }
        return candidate.visibleHeight > current.visibleHeight ? candidate : current;
      });

      return photoBySlug.get(focusedTile.tile.dataset.photoSlug ?? "");
    };

    const updateTitle = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const photo = getFocusedPhoto();

        if (photo) {
          setActivePhoto((current) => current?.slug === photo.slug ? current : photo);
        }
      });
    };

    const activateCenteredPhoto = () => {
      if (window.innerWidth >= 768) return;
      const photo = getFocusedPhoto();

      if (!photo) return;
      setActivePhoto((current) => current?.slug === photo.slug ? current : photo);
      setMobileHeader("title");
      scheduleColorBlocks(photo, 0);
    };

    const scheduleCenteredPhoto = () => {
      if (centeredPhotoTimer) clearTimeout(centeredPhotoTimer);

      if (window.innerWidth >= 768 || window.scrollY <= 12) {
        activeSlug.current = "";
        resetColor();
        setMobileHeader("navigation");
        return;
      }

      centeredPhotoTimer = setTimeout(() => {
        centeredPhotoTimer = undefined;
        activateCenteredPhoto();
      }, 850);
    };

    setMobileHeader("navigation");
    updateTitle();
    scheduleCenteredPhoto();
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > previousScrollY;
      previousScrollY = currentScrollY;

      activeSlug.current = "";
      resetColor();
      updateTitle();

      if (isScrollingDown && currentScrollY > 12) {
        setMobileHeader("title");
        scheduleCenteredPhoto();
      } else {
        if (centeredPhotoTimer) {
          clearTimeout(centeredPhotoTimer);
          centeredPhotoTimer = undefined;
        }
        setMobileHeader("navigation");
      }
    };
    const handleResize = () => {
      previousScrollY = window.scrollY;
      activeSlug.current = "";
      resetColor();
      setMobileHeader("navigation");
      updateTitle();
      scheduleCenteredPhoto();
    };
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      if (centeredPhotoTimer) clearTimeout(centeredPhotoTimer);
      activeSlug.current = "";
      resetColor();
      window.cancelAnimationFrame(frame);
      delete document.documentElement.dataset.mobileGalleryHeader;
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  // The preview helpers intentionally read the latest render values through refs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos]);

  return (
    <>
      <section className={styles.photoGrid} aria-label="Photographies" ref={grid}>
        {photos.map((photo, index) => (
          <PhotoTile
            className={styles.item}
            key={photo.slug}
            onPreviewEnd={endPreview}
            onPreviewStart={preview}
            photo={photo}
            priority={index < 3}
            style={{ "--photo-ratio": `${photo.width} / ${photo.height}` } as React.CSSProperties}
          />
        ))}
        <InstagramLink className={styles.mobileInstagram} />
      </section>
      <div className={styles.gridHeader}>
        <div className={styles.gridMeta} ref={gridMeta} aria-live="polite">
          <span>{activePhoto?.title}</span>
        </div>
      </div>
    </>
  );
}
