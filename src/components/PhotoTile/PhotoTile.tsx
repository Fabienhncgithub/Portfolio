"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useRef } from "react";
import type { Photo } from "@/lib/photos";
import { FadeIn } from "@/components/FadeIn/FadeIn";
import styles from "./PhotoTile.module.scss";

export function PhotoTile({
  photo,
  className = "",
  priority = false,
  delay = 0,
  style,
  onPreviewEnd,
  onPreviewStart,
}: {
  photo: Photo;
  className?: string;
  priority?: boolean;
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
        aria-label={`Voir ${photo.title}`}
        data-photo-interactive
        data-photo-slug={photo.slug}
        onBlur={onPreviewEnd}
        onClick={(event) => {
          sessionStorage.setItem(
            "photo-pointer-position",
            JSON.stringify({ x: event.clientX, y: event.clientY, at: Date.now() }),
          );
        }}
        onFocus={() => onPreviewStart?.(photo, image.current)}
        onMouseEnter={() => onPreviewStart?.(photo, image.current)}
        onMouseLeave={onPreviewEnd}
      >
        <figure>
          <div className={styles.photoFrame}>
            <Image
              alt={`${photo.title}, ${photo.location}`}
              fill
              ref={image}
              priority={priority}
              sizes="(max-width: 768px) 100vw, 80vw"
              src={photo.image}
            />
            <span className={styles.colorLayer} data-photo-color-layer aria-hidden="true" />
          </div>
          <figcaption className={styles.caption}>
            <span>{photo.title}</span>
            <time dateTime={String(photo.year)}>{photo.year}</time>
          </figcaption>
        </figure>
      </Link>
    </FadeIn>
  );
}
