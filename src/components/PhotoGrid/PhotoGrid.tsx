"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { InstagramLink } from "@/components/InstagramLink/InstagramLink";
import { PhotoTile } from "@/components/PhotoTile/PhotoTile";
import type { Photo } from "@/lib/photos";
import styles from "./PhotoGrid.module.scss";
import { usePhotoPreviewController } from "./usePhotoPreviewController";
import { usePointerPhotoPreview } from "./usePointerPhotoPreview";
import { useTouchGalleryFocus } from "./useTouchGalleryFocus";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const grid = useRef<HTMLElement>(null);
  const gridHeader = useRef<HTMLDivElement>(null);
  const gridMeta = useRef<HTMLDivElement>(null);
  const [activePhoto, setActivePhoto] = useState<Photo | undefined>(photos[0]);

  const {
    activateTouchPreview,
    clearColorPreview,
    endPreview,
    startPreview,
  } = usePhotoPreviewController({
    grid,
    gridHeader,
    gridMeta,
    onActivePhotoChange: setActivePhoto,
  });

  usePointerPhotoPreview({
    grid,
    photos,
    onPreviewEnd: endPreview,
    onPreviewStart: startPreview,
  });

  useTouchGalleryFocus({
    grid,
    gridHeader,
    photos,
    onActivePhotoChange: setActivePhoto,
    onPreviewActivate: activateTouchPreview,
    onPreviewClear: clearColorPreview,
  });

  useEffect(() => {
    setActivePhoto((current) => {
      if (!photos.length) return undefined;
      if (current && photos.some((photo) => photo.slug === current.slug)) return current;
      return photos[0];
    });
  }, [photos]);

  return (
    <>
      <section className={styles.photoGrid} aria-label="Photographs" ref={grid}>
        {photos.length ? photos.map((photo, index) => (
          <PhotoTile
            className={styles.item}
            key={photo.slug}
            onPreviewEnd={endPreview}
            onPreviewStart={startPreview}
            photo={photo}
            priority={index < 3}
            style={{ "--photo-ratio": `${photo.width} / ${photo.height}` } as CSSProperties}
          />
        )) : (
          <p className={styles.emptyState}>No photographs published.</p>
        )}
        <InstagramLink className={styles.mobileInstagram} />
      </section>
      <div className={styles.gridHeader} data-gallery-header ref={gridHeader}>
        <div className={styles.gridMeta} ref={gridMeta} aria-hidden="true">
          <span>{activePhoto?.title ?? ""}</span>
        </div>
      </div>
    </>
  );
}
