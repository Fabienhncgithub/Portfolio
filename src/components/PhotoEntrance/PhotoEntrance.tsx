"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { MouseEvent } from "react";
import { useEffect, useRef } from "react";
import { getSessionItem, removeSessionItem } from "@/lib/sessionStorage";
import styles from "./PhotoEntrance.module.scss";

gsap.registerPlugin(useGSAP);

type SavedPointer = {
  x: number;
  y: number;
  at: number;
};

function parseSavedPointer(value: string): SavedPointer | undefined {
  try {
    const candidate: unknown = JSON.parse(value);
    if (!candidate || typeof candidate !== "object") return;

    const pointer = candidate as Partial<SavedPointer>;
    if (
      !Number.isFinite(pointer.x)
      || !Number.isFinite(pointer.y)
      || !Number.isFinite(pointer.at)
    ) return;

    return pointer as SavedPointer;
  } catch {
    return;
  }
}

export function PhotoEntrance({
  children,
  className,
  preview,
  style,
}: {
  children: ReactNode;
  className?: string;
  preview?: ReactNode;
  style?: CSSProperties;
}) {
  const container = useRef<HTMLDivElement>(null);
  const closeCursor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = closeCursor.current;
    return () => {
      if (element) gsap.killTweensOf(element);
    };
  }, []);

  useEffect(() => {
    const link = container.current?.querySelector(`.${styles.photoLink}`);
    const previewImage = link?.querySelector<HTMLImageElement>(
      `.${styles.previewImage} img`,
    );
    const fullImage = link?.querySelector<HTMLImageElement>(
      `.${styles.fullImage} img`,
    );
    if (!link || !fullImage) return;

    const revealPreview = () => {
      link.setAttribute("data-preview-loaded", "true");
    };
    const revealFull = () => {
      link.setAttribute("data-full-loaded", "true");
    };

    if (previewImage?.complete && previewImage.naturalWidth > 0) revealPreview();
    else previewImage?.addEventListener("load", revealPreview, { once: true });

    if (fullImage.complete && fullImage.naturalWidth > 0) revealFull();
    else fullImage.addEventListener("load", revealFull, { once: true });

    return () => {
      previewImage?.removeEventListener("load", revealPreview);
      fullImage.removeEventListener("load", revealFull);
    };
  }, [preview]);

  useGSAP(() => {
    const savedPointer = getSessionItem("photo-pointer-position");
    if (!savedPointer) return;

    try {
      if (
        !closeCursor.current
        || !window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches
      ) return;

      const pointer = parseSavedPointer(savedPointer);
      if (!pointer) return;

      const link = closeCursor.current.closest("a");
      const bounds = link?.getBoundingClientRect();
      const pointerAge = Date.now() - pointer.at;

      if (bounds && pointerAge >= 0 && pointerAge < 2000) {
        gsap.set(closeCursor.current, {
          x: pointer.x - bounds.left,
          y: pointer.y - bounds.top,
          scale: 0.68,
        });
        gsap.to(closeCursor.current, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.42,
          ease: "power3.out",
        });
      }
    } finally {
      removeSessionItem("photo-pointer-position");
    }
  }, { scope: container });

  function moveCloseCursor(event: MouseEvent<HTMLAnchorElement>, immediate = false) {
    if (!closeCursor.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };

    if (immediate) {
      gsap.set(closeCursor.current, position);
      return;
    }

    gsap.to(closeCursor.current, {
      ...position,
      duration: 0.18,
      ease: "power3.out",
      overwrite: "auto",
    });
  }

  function setCloseCursorVisibility(visible: boolean) {
    if (
      !closeCursor.current
      || !window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches
    ) return;

    gsap.to(closeCursor.current, {
      autoAlpha: visible ? 1 : 0,
      scale: visible ? 1 : 0.86,
      duration: visible ? 0.42 : 0.07,
      ease: visible ? "power3.out" : "power2.out",
      overwrite: true,
    });
  }

  return (
    <div ref={container}>
      <Link
        aria-label="Back to all photographs"
        className={`${className ?? ""} ${styles.photoLink}`}
        data-analytics-event="gallery_return"
        data-analytics-method="image"
        href="/"
        onMouseEnter={(event) => {
          moveCloseCursor(event, true);
          setCloseCursorVisibility(true);
        }}
        onMouseLeave={() => setCloseCursorVisibility(false)}
        onMouseMove={moveCloseCursor}
        style={style}
      >
        <span className={styles.loadingLayer} aria-hidden="true" />
        {preview && <span className={styles.previewImage}>{preview}</span>}
        <span className={styles.fullImage}>{children}</span>
        <span className={styles.closeCursor} ref={closeCursor} aria-hidden="true" />
      </Link>
    </div>
  );
}
