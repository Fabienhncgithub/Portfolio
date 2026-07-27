"use client";

import gsap from "gsap";
import { useRef } from "react";
import { PhotoTile } from "@/components/PhotoTile/PhotoTile";
import type { Photo } from "@/lib/photos";
import styles from "./PhotoGrid.module.scss";

function dominantColor(image: HTMLImageElement) {
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
    return `rgb(${Math.round(mostUsed.red / mostUsed.count)} ${Math.round(mostUsed.green / mostUsed.count)} ${Math.round(mostUsed.blue / mostUsed.count)})`;
  } catch {
    return;
  }
}

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const grid = useRef<HTMLElement>(null);
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activeSlug = useRef("");

  function resetColor() {
    if (dwellTimer.current) clearTimeout(dwellTimer.current);
    const layers = grid.current?.querySelectorAll("[data-photo-color-layer]");
    if (layers) {
      gsap.to(layers, {
        autoAlpha: 0,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true,
      });
    }
  }

  function preview(photo: Photo, image: HTMLImageElement | null) {
    resetColor();
    activeSlug.current = photo.slug;

    dwellTimer.current = setTimeout(() => {
      if (!image || activeSlug.current !== photo.slug) return;
      const color = dominantColor(image);
      if (!color) return;

      grid.current?.querySelectorAll<HTMLElement>("[data-photo-slug]").forEach((tile) => {
        const layer = tile.querySelector("[data-photo-color-layer]");
        if (!layer) return;
        gsap.to(layer, {
          autoAlpha: tile.dataset.photoSlug === photo.slug ? 0 : 0.34,
          backgroundColor: color,
          duration: 0.8,
          ease: "power2.inOut",
          overwrite: true,
        });
      });
    }, 2500);
  }

  function endPreview() {
    activeSlug.current = "";
    resetColor();
  }

  return (
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
    </section>
  );
}
