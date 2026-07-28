"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
import type { Photo } from "@/lib/photos";
import { POINTER_SCROLL_SETTLE_DELAY } from "./constants";

type PointerPhotoPreviewOptions = {
  grid: RefObject<HTMLElement>;
  photos: Photo[];
  onPreviewEnd: () => void;
  onPreviewStart: (photo: Photo) => void;
};

export function usePointerPhotoPreview({
  grid,
  photos,
  onPreviewEnd,
  onPreviewStart,
}: PointerPhotoPreviewOptions) {
  const pointerPosition = useRef<{ x: number; y: number }>();
  const photoBySlug = useMemo(
    () => new Map(photos.map((photo) => [photo.slug, photo])),
    [photos],
  );

  useEffect(() => {
    let syncFrame = 0;
    let scrollTimer: ReturnType<typeof setTimeout> | undefined;

    const syncPreviewAtPointer = () => {
      const position = pointerPosition.current;
      const gridElement = grid.current;
      if (!position || !gridElement) {
        onPreviewEnd();
        return;
      }

      const target = document.elementFromPoint(position.x, position.y);
      const tile = target?.closest<HTMLElement>("[data-photo-slug]");
      const photo = photoBySlug.get(tile?.dataset.photoSlug ?? "");

      if (tile && gridElement.contains(tile) && photo) onPreviewStart(photo);
      else onPreviewEnd();
    };

    const syncAfterLayout = () => {
      window.cancelAnimationFrame(syncFrame);
      syncFrame = window.requestAnimationFrame(() => {
        syncFrame = window.requestAnimationFrame(syncPreviewAtPointer);
      });
    };

    const rememberPointer = (event: PointerEvent | WheelEvent) => {
      if ("pointerType" in event && event.pointerType === "touch") return;
      pointerPosition.current = { x: event.clientX, y: event.clientY };
    };

    const rememberAndSyncPointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        onPreviewEnd();
        return;
      }

      rememberPointer(event);
      syncAfterLayout();
    };

    const resetDuringScroll = () => {
      onPreviewEnd();
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(syncAfterLayout, POINTER_SCROLL_SETTLE_DELAY);
    };

    const leaveViewport = () => {
      pointerPosition.current = undefined;
      onPreviewEnd();
    };

    window.addEventListener("pointermove", rememberPointer, { passive: true });
    window.addEventListener("pointerover", rememberAndSyncPointer, { passive: true });
    window.addEventListener("pointerdown", rememberAndSyncPointer, { passive: true });
    window.addEventListener("wheel", rememberPointer, { passive: true });
    window.addEventListener("scroll", resetDuringScroll, { capture: true, passive: true });
    window.addEventListener("scrollend", syncAfterLayout, { passive: true });
    window.addEventListener("focus", syncAfterLayout);
    window.addEventListener("blur", onPreviewEnd);
    document.documentElement.addEventListener("pointerleave", leaveViewport);

    return () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      window.cancelAnimationFrame(syncFrame);
      window.removeEventListener("pointermove", rememberPointer);
      window.removeEventListener("pointerover", rememberAndSyncPointer);
      window.removeEventListener("pointerdown", rememberAndSyncPointer);
      window.removeEventListener("wheel", rememberPointer);
      window.removeEventListener("scroll", resetDuringScroll, true);
      window.removeEventListener("scrollend", syncAfterLayout);
      window.removeEventListener("focus", syncAfterLayout);
      window.removeEventListener("blur", onPreviewEnd);
      document.documentElement.removeEventListener("pointerleave", leaveViewport);
    };
  }, [grid, onPreviewEnd, onPreviewStart, photoBySlug]);
}
