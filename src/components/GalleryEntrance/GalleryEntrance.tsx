"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import type { ReactNode } from "react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollToPlugin);

export function GalleryEntrance({ children }: { children: ReactNode }) {
  const gallery = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top: 0 });
      return;
    }

    const root = gallery.current;
    if (!root) return;

    let entrance: gsap.core.Tween | undefined;
    let animationFrame = 0;
    const previousScrollRestoration = history.scrollRestoration;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    history.scrollRestoration = "manual";
    document.documentElement.style.scrollBehavior = "auto";

    const positionAtBottom = () => {
      const bottom = Math.max(0, root.offsetTop + root.scrollHeight - window.innerHeight);
      window.scrollTo(0, bottom);

      // A painted frame at the bottom makes the full upward movement perceptible.
      animationFrame = window.requestAnimationFrame(() => {
        entrance = gsap.to(window, {
          scrollTo: { y: 0, autoKill: false },
          duration: 1,
          ease: "power2.inOut",
          onComplete: () => {
            history.scrollRestoration = previousScrollRestoration;
            document.documentElement.style.scrollBehavior = previousScrollBehavior;
          },
        });
      });
    };

    // Wait for Next.js scroll restoration, then take control immediately.
    animationFrame = window.requestAnimationFrame(positionAtBottom);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      entrance?.kill();
      history.scrollRestoration = previousScrollRestoration;
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    };
  }, { scope: gallery });

  return <div ref={gallery}>{children}</div>;
}
