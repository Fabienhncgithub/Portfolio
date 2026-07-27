"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function PhotoKeyboardNavigation({
  previousHref,
  nextHref,
}: {
  previousHref?: string;
  nextHref?: string;
}) {
  const router = useRouter();

  useEffect(() => {
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
  }, [nextHref, previousHref, router]);

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let tracking = false;

    const startSwipe = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        tracking = false;
        return;
      }

      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      currentX = startX;
      currentY = startY;
      tracking = true;
    };

    const trackSwipe = (event: TouchEvent) => {
      if (!tracking || event.touches.length !== 1) return;

      const touch = event.touches[0];
      currentX = touch.clientX;
      currentY = touch.clientY;
      const distanceX = currentX - startX;
      const distanceY = currentY - startY;

      if (Math.abs(distanceX) > 12 && Math.abs(distanceX) > Math.abs(distanceY) * 1.25) {
        event.preventDefault();
      }
    };

    const endSwipe = () => {
      if (!tracking) return;
      tracking = false;

      const distanceX = currentX - startX;
      const distanceY = currentY - startY;
      const threshold = Math.max(56, window.innerWidth * 0.14);
      const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY) * 1.35;

      if (!isHorizontal || Math.abs(distanceX) < threshold) return;

      if (distanceX < 0 && nextHref) {
        router.push(nextHref);
      } else if (distanceX > 0 && previousHref) {
        router.push(previousHref);
      }
    };

    const cancelSwipe = () => {
      tracking = false;
    };

    window.addEventListener("touchstart", startSwipe, { passive: true });
    window.addEventListener("touchmove", trackSwipe, { passive: false });
    window.addEventListener("touchend", endSwipe, { passive: true });
    window.addEventListener("touchcancel", cancelSwipe, { passive: true });

    return () => {
      window.removeEventListener("touchstart", startSwipe);
      window.removeEventListener("touchmove", trackSwipe);
      window.removeEventListener("touchend", endSwipe);
      window.removeEventListener("touchcancel", cancelSwipe);
    };
  }, [nextHref, previousHref, router]);

  return null;
}
