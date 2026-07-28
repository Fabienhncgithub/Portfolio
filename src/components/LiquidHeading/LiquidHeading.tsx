"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import styles from "./LiquidHeading.module.scss";

gsap.registerPlugin(useGSAP);

const DESKTOP_POINTER_QUERY =
  "(min-width: 1200px) and (any-hover: hover) and (any-pointer: fine)";
const TOUCH_POINTER_QUERY =
  "(any-pointer: coarse)";

export function LiquidHeading({
  children,
  className = "",
  as = "h1",
}: {
  children: string;
  className?: string;
  as?: "h1" | "p";
}) {
  const heading = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    const element = heading.current;
    if (!element) return;

    const letters = [...element.querySelectorAll<HTMLElement>("[data-liquid-letter]")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktopPointer = window.matchMedia(DESKTOP_POINTER_QUERY);
    const touchPointer = window.matchMedia(TOUCH_POINTER_QUERY);
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let interactionActive = false;

    if (!reducedMotion) {
      gsap.fromTo(
        letters,
        { autoAlpha: 0, filter: "blur(8px)", yPercent: 55 },
        {
          autoAlpha: 1,
          filter: "blur(0px)",
          yPercent: 0,
          duration: 0.9,
          ease: "power4.out",
          stagger: { amount: 0.42, from: "start" },
          onComplete: () => {
            gsap.set(letters, { clearProps: "filter,opacity,visibility,yPercent" });
          },
        },
      );
    }

    const renderPointer = () => {
      pointerFrame = 0;
      const headingBounds = element.getBoundingClientRect();
      const outsideX = Math.max(
        headingBounds.left - pointerX,
        0,
        pointerX - headingBounds.right,
      );
      const outsideY = Math.max(
        headingBounds.top - pointerY,
        0,
        pointerY - headingBounds.bottom,
      );
      const outsideDistance = Math.hypot(outsideX, outsideY);
      const exteriorProgress = Math.min(1, outsideDistance / 180);
      const attractionRadius = 280 + (exteriorProgress * 220);
      const exteriorPull = 1 + (exteriorProgress * 1.35);

      letters.forEach((letter) => {
        const bounds = letter.getBoundingClientRect();
        const centerX = bounds.left + (bounds.width / 2);
        const centerY = bounds.top + (bounds.height / 2);
        const deltaX = pointerX - centerX;
        const deltaY = pointerY - centerY;
        const distance = Math.hypot(deltaX, deltaY);
        const influence = Math.max(0, 1 - (distance / attractionRadius));
        const pullX = gsap.utils.clamp(
          -125,
          125,
          deltaX * influence * 0.78 * exteriorPull,
        );
        const pullY = gsap.utils.clamp(
          -105,
          105,
          deltaY * influence * 0.7 * exteriorPull,
        );
        const chromaticShift =
          influence * (4.2 + (exteriorProgress * 1.8));
        const chromaticAlpha =
          influence * (0.46 + (exteriorProgress * 0.1));
        const pullAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        const stretch = 0.9 + (exteriorProgress * 0.65);

        gsap.to(letter, {
          x: pullX,
          y: pullY,
          scaleX: 1 + (influence * stretch),
          scaleY: 1 - (influence * (0.32 + (exteriorProgress * 0.14))),
          skewX: deltaX * influence * (0.055 + (exteriorProgress * 0.025)),
          rotation: influence * pullAngle * (0.12 + (exteriorProgress * 0.05)),
          textShadow: influence > 0
            ? `${chromaticShift}px 0 0 rgba(255, 16, 65, ${chromaticAlpha}), ${-chromaticShift}px 0 0 rgba(0, 170, 255, ${chromaticAlpha}), 0 ${chromaticShift * 0.72}px 0 rgba(255, 204, 0, ${chromaticAlpha * 0.82})`
            : "0 0 0 rgba(255, 35, 75, 0), 0 0 0 rgba(0, 180, 255, 0), 0 0 0 rgba(255, 205, 30, 0)",
          duration: 0.46,
          ease: "power2.out",
          overwrite: true,
        });
      });
    };

    const resetLetters = () => {
      window.cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;

      gsap.to(letters, {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        rotation: 0,
        duration: 1.45,
        ease: "elastic.out(0.8, 0.42)",
        stagger: {
          amount: 0.12,
          from: "random",
        },
        overwrite: "auto",
      });

      gsap.to(letters, {
        textShadow:
          "0 0 0 rgba(255, 35, 75, 0), 0 0 0 rgba(0, 180, 255, 0), 0 0 0 rgba(255, 205, 30, 0)",
        duration: 1.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const handlePointerEnter = (event: PointerEvent) => {
      if (!desktopPointer.matches && !touchPointer.matches) return;
      interactionActive = true;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(renderPointer);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (
        !interactionActive
        || (!desktopPointer.matches && !touchPointer.matches)
      ) {
        return;
      }

      const bounds = element.getBoundingClientRect();
      const outsideX = Math.max(bounds.left - event.clientX, 0, event.clientX - bounds.right);
      const outsideY = Math.max(bounds.top - event.clientY, 0, event.clientY - bounds.bottom);
      const outsideDistance = Math.hypot(outsideX, outsideY);

      if (outsideDistance > 440) {
        interactionActive = false;
        resetLetters();
        return;
      }

      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(renderPointer);
    };

    const endInteraction = () => {
      if (!interactionActive) return;
      interactionActive = false;
      resetLetters();
    };

    const endTouchInteraction = (event: PointerEvent) => {
      if (event.pointerType === "touch") endInteraction();
    };

    element.addEventListener("pointerenter", handlePointerEnter, { passive: true });
    element.addEventListener("pointerdown", handlePointerEnter, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", endTouchInteraction, { passive: true });
    window.addEventListener("pointercancel", endTouchInteraction, { passive: true });
    window.addEventListener("blur", endInteraction);
    window.addEventListener("scroll", endInteraction, { passive: true });

    return () => {
      window.cancelAnimationFrame(pointerFrame);
      gsap.killTweensOf(letters);
      element.removeEventListener("pointerenter", handlePointerEnter);
      element.removeEventListener("pointerdown", handlePointerEnter);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", endTouchInteraction);
      window.removeEventListener("pointercancel", endTouchInteraction);
      window.removeEventListener("blur", endInteraction);
      window.removeEventListener("scroll", endInteraction);
    };
  }, { scope: heading });

  const parts = children.split(/(\s+)/);

  const content = (
    <>
      <span aria-hidden="true">
        {parts.map((part, partIndex) => (
          /\s+/.test(part) ? part : (
            <span className={styles.word} key={`${part}-${partIndex}`}>
              {[...part].map((letter, letterIndex) => (
                <span
                  className={styles.letter}
                  data-liquid-letter
                  key={`${letter}-${letterIndex}`}
                >
                  {letter}
                </span>
              ))}
            </span>
          )
        ))}
      </span>
    </>
  );

  const sharedProps = {
    "aria-label": children,
    className: `${styles.heading} ${className}`,
  };

  if (as === "p") {
    return (
      <p ref={(element) => { heading.current = element; }} {...sharedProps}>
        {content}
      </p>
    );
  }

  return (
    <h1 ref={(element) => { heading.current = element; }} {...sharedProps}>
      {content}
    </h1>
  );
}
