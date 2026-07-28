"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { updateGalleryReturnSlug } from "@/lib/galleryReturnState";

type PreloadImage = {
  sizes?: string;
  src: string;
  srcSet?: string;
};

export function PhotoKeyboardNavigation({
  previousHref,
  nextHref,
  previousImage,
  nextImage,
  previousPreviewImage,
  nextPreviewImage,
  currentSlug,
  swipeSurfaceId,
}: {
  previousHref?: string;
  nextHref?: string;
  previousImage?: PreloadImage;
  nextImage?: PreloadImage;
  previousPreviewImage?: PreloadImage;
  nextPreviewImage?: PreloadImage;
  currentSlug: string;
  swipeSurfaceId?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    updateGalleryReturnSlug(currentSlug);
    router.prefetch("/");
    if (previousHref) router.prefetch(previousHref);
    if (nextHref) router.prefetch(nextHref);

    function navigate(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isEditing =
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT";

      if (isEditing || event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "Escape") {
        router.push("/");
      } else if (event.key === "ArrowLeft" && previousHref) {
        router.push(previousHref);
      } else if (event.key === "ArrowRight" && nextHref) {
        router.push(nextHref);
      } else {
        return;
      }

      event.preventDefault();
    }

    window.addEventListener("keydown", navigate);
    return () => window.removeEventListener("keydown", navigate);
  }, [currentSlug, nextHref, previousHref, router]);

  useEffect(() => {
    const preloads = [
      previousPreviewImage,
      nextPreviewImage,
      previousImage,
      nextImage,
    ]
      .filter((image): image is PreloadImage => Boolean(image))
      .map((image) => {
        const preload = new window.Image();
        if (image.sizes) preload.sizes = image.sizes;
        if (image.srcSet) preload.srcset = image.srcSet;
        preload.src = image.src;
        return preload;
      });

    return () => {
      for (const preload of preloads) {
        preload.onload = null;
        preload.onerror = null;
      }
    };
  }, [
    nextImage,
    nextPreviewImage,
    previousImage,
    previousPreviewImage,
  ]);

  useEffect(() => {
    if (!swipeSurfaceId || (!previousHref && !nextHref)) return;

    const surface = document.getElementById(swipeSurfaceId);
    if (!surface) return;

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let touchIdentifier = -1;
    let intent: "horizontal" | "pending" | "vertical" = "pending";
    let tracking = false;

    const resetSwipe = () => {
      intent = "pending";
      touchIdentifier = -1;
      tracking = false;
    };

    const matchingTouch = (touches: TouchList) => {
      for (let index = 0; index < touches.length; index += 1) {
        if (touches[index].identifier === touchIdentifier) return touches[index];
      }
    };

    // The scene itself is intentionally a link back to the gallery. It remains
    // swipeable, while taps keep their native link behavior.
    const isPhotoImageLink = (element: HTMLElement) => (
      element instanceof HTMLAnchorElement
      && surface.contains(element)
      && Boolean(element.querySelector("img"))
    );

    const startedOnIgnoredControl = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return true;

      const interactive = target.closest<HTMLElement>(
        "a, button, input, textarea, select, summary, [role='button'], [contenteditable='true']",
      );

      return Boolean(interactive && !isPhotoImageLink(interactive));
    };

    const startSwipe = (event: TouchEvent) => {
      if (event.touches.length !== 1 || startedOnIgnoredControl(event.target)) {
        resetSwipe();
        return;
      }

      const touch = event.touches[0];
      const edgeGuard = Math.max(24, Math.min(40, window.innerWidth * 0.08));
      if (
        touch.clientX <= edgeGuard
        || touch.clientX >= window.innerWidth - edgeGuard
      ) {
        resetSwipe();
        return;
      }

      startX = touch.clientX;
      startY = touch.clientY;
      currentX = startX;
      currentY = startY;
      touchIdentifier = touch.identifier;
      intent = "pending";
      tracking = true;
    };

    const trackSwipe = (event: TouchEvent) => {
      if (!tracking || event.touches.length !== 1) {
        resetSwipe();
        return;
      }

      const touch = matchingTouch(event.touches);
      if (!touch) {
        resetSwipe();
        return;
      }

      currentX = touch.clientX;
      currentY = touch.clientY;
      const distanceX = currentX - startX;
      const distanceY = currentY - startY;
      const absoluteX = Math.abs(distanceX);
      const absoluteY = Math.abs(distanceY);

      if (intent === "pending" && Math.max(absoluteX, absoluteY) >= 12) {
        if (absoluteX > absoluteY * 1.25) intent = "horizontal";
        else if (absoluteY > absoluteX * 1.1) intent = "vertical";
      }

      if (intent === "vertical") {
        resetSwipe();
        return;
      }

      if (intent === "horizontal" && event.cancelable) event.preventDefault();
    };

    const endSwipe = (event: TouchEvent) => {
      if (!tracking) return;

      const touch = matchingTouch(event.changedTouches);
      if (touch) {
        currentX = touch.clientX;
        currentY = touch.clientY;
      }

      const distanceX = currentX - startX;
      const distanceY = currentY - startY;
      const threshold = Math.max(56, Math.min(96, window.innerWidth * 0.14));
      const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY) * 1.35;
      const shouldNavigate =
        intent === "horizontal"
        && isHorizontal
        && Math.abs(distanceX) >= threshold;

      resetSwipe();
      if (!shouldNavigate) return;

      if (distanceX < 0 && nextHref) {
        router.push(nextHref);
      } else if (distanceX > 0 && previousHref) {
        router.push(previousHref);
      }
    };

    surface.addEventListener("touchstart", startSwipe, { passive: true });
    surface.addEventListener("touchmove", trackSwipe, { passive: false });
    surface.addEventListener("touchend", endSwipe, { passive: true });
    surface.addEventListener("touchcancel", resetSwipe, { passive: true });

    return () => {
      surface.removeEventListener("touchstart", startSwipe);
      surface.removeEventListener("touchmove", trackSwipe);
      surface.removeEventListener("touchend", endSwipe);
      surface.removeEventListener("touchcancel", resetSwipe);
    };
  }, [nextHref, previousHref, router, swipeSurfaceId]);

  return null;
}
