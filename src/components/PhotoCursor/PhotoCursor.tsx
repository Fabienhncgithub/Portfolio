"use client";

import gsap from "gsap";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import styles from "./PhotoCursor.module.scss";

export function PhotoCursor() {
  const cursor = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const element = cursor.current;
    if (!element || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    if (pathname.startsWith("/photo/")) {
      gsap.killTweensOf(element);
      gsap.set(element, { autoAlpha: 0, scale: 0.72 });
      return;
    }

    const moveX = gsap.quickTo(element, "x", { duration: 0.22, ease: "power3.out" });
    const moveY = gsap.quickTo(element, "y", { duration: 0.22, ease: "power3.out" });
    let visible = false;
    let hideCall: gsap.core.Tween | undefined;

    function show() {
      hideCall?.kill();
      if (visible) return;
      visible = true;
      gsap.to(element, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
    }

    function hide() {
      hideCall?.kill();
      hideCall = gsap.delayedCall(0, () => {
        visible = false;
        gsap.to(element, {
          autoAlpha: 0,
          scale: 0.86,
          duration: 0.07,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    }

    function track(event: PointerEvent) {
      moveX(event.clientX);
      moveY(event.clientY);

      const target = event.target as Element | null;
      if (target?.closest("[data-photo-interactive]")) show();
      else hide();
    }

    window.addEventListener("pointermove", track, { passive: true });
    return () => {
      hideCall?.kill();
      window.removeEventListener("pointermove", track);
    };
  }, [pathname]);

  return <span className={styles.cursor} ref={cursor} aria-hidden="true" />;
}
