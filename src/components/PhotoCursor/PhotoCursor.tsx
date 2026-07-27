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
    if (
      !element
      || !window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches
    ) return;

    if (pathname.startsWith("/photo/")) {
      gsap.killTweensOf(element);
      gsap.set(element, { autoAlpha: 0, scale: 0.72 });
      return;
    }

    const moveX = gsap.quickTo(element, "x", { duration: 0.22, ease: "power3.out" });
    const moveY = gsap.quickTo(element, "y", { duration: 0.22, ease: "power3.out" });
    let visible = false;
    let hideCall: gsap.core.Tween | undefined;
    let pointerX = -1;
    let pointerY = -1;
    let scrollFrame = 0;

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

    function syncTarget() {
      if (pointerX < 0 || pointerY < 0) {
        hide();
        return;
      }

      const target = document.elementFromPoint(pointerX, pointerY);
      if (target?.closest("[data-photo-interactive]")) show();
      else hide();
    }

    function track(event: PointerEvent) {
      pointerX = event.clientX;
      pointerY = event.clientY;
      moveX(pointerX);
      moveY(pointerY);
      syncTarget();
    }

    function trackWheel(event: WheelEvent) {
      pointerX = event.clientX;
      pointerY = event.clientY;
      moveX(pointerX);
      moveY(pointerY);
      syncAfterScroll();
    }

    function syncAfterScroll() {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = window.requestAnimationFrame(() => {
          scrollFrame = 0;
          syncTarget();
        });
      });
    }

    function suspend() {
      hide();
    }

    function leaveViewport() {
      pointerX = -1;
      pointerY = -1;
      hide();
    }

    window.addEventListener("pointermove", track, { passive: true });
    window.addEventListener("pointerover", track, { passive: true });
    window.addEventListener("pointerdown", track, { passive: true });
    window.addEventListener("wheel", trackWheel, { passive: true });
    window.addEventListener("scroll", syncAfterScroll, { capture: true, passive: true });
    window.addEventListener("scrollend", syncAfterScroll, { passive: true });
    window.addEventListener("resize", syncAfterScroll, { passive: true });
    window.addEventListener("focus", syncAfterScroll);
    window.addEventListener("blur", suspend);
    document.documentElement.addEventListener("pointerleave", leaveViewport);

    return () => {
      hideCall?.kill();
      window.cancelAnimationFrame(scrollFrame);
      window.removeEventListener("pointermove", track);
      window.removeEventListener("pointerover", track);
      window.removeEventListener("pointerdown", track);
      window.removeEventListener("wheel", trackWheel);
      window.removeEventListener("scroll", syncAfterScroll, true);
      window.removeEventListener("scrollend", syncAfterScroll);
      window.removeEventListener("resize", syncAfterScroll);
      window.removeEventListener("focus", syncAfterScroll);
      window.removeEventListener("blur", suspend);
      document.documentElement.removeEventListener("pointerleave", leaveViewport);
    };
  }, [pathname]);

  return <span className={styles.cursor} ref={cursor} aria-hidden="true" />;
}
