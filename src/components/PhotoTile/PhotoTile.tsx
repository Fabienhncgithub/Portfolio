"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useRef } from "react";
import type { Photo } from "@/lib/photos";
import { FadeIn } from "@/components/FadeIn/FadeIn";
import { saveGalleryReturnState } from "@/lib/galleryReturnState";
import { setSessionItem } from "@/lib/sessionStorage";
import styles from "./PhotoTile.module.scss";

export function PhotoTile({
  photo,
  className = "",
  priority = false,
  sizes = "(any-pointer: coarse) calc(100vw - 2rem), (max-width: 1199px) calc(100vw - 2rem), (max-width: 1919px) 25vw, 24vw",
  delay = 0,
  style,
  onPreviewEnd,
  onPreviewStart,
}: {
  photo: Photo;
  className?: string;
  priority?: boolean;
  sizes?: string;
  delay?: number;
  style?: CSSProperties;
  onPreviewEnd?: () => void;
  onPreviewStart?: (photo: Photo, image: HTMLImageElement | null) => void;
}) {
  const image = useRef<HTMLImageElement>(null);

  return (
    <FadeIn
      className={`${styles.photoTile} ${className}`}
      delay={delay}
      style={style}
    >
      <Link
        href={`/photo/${photo.slug}`}
        aria-label={`View ${photo.title}`}
        data-analytics-event="photo_open"
        data-analytics-photo-slug={photo.slug}
        data-analytics-photo-title={photo.title}
        data-photo-interactive
        data-photo-slug={photo.slug}
        onBlur={onPreviewEnd}
        onClick={(event) => {
          saveGalleryReturnState(photo.slug, window.scrollY);
          setSessionItem(
            "photo-pointer-position",
            JSON.stringify({ x: event.clientX, y: event.clientY, at: Date.now() }),
          );
        }}
        onFocus={() => onPreviewStart?.(photo, image.current)}
        onPointerEnter={(event) => {
          if (event.pointerType !== "touch") onPreviewStart?.(photo, image.current);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "touch") onPreviewEnd?.();
        }}
      >
        <figure>
          <div className={styles.photoFrame}>
            <Image
              alt={photo.alt}
              fill
              ref={image}
              priority={priority}
              data-photo-image
              sizes={sizes}
              src={photo.image}
            />
            <span className={styles.colorLayer} data-photo-color-layer aria-hidden="true" />
          </div>
        </figure>
      </Link>
    </FadeIn>
  );
}
