"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import type { ReactNode } from "react";
import { useRef } from "react";
import {
  readGalleryReturnState,
  removeGalleryReturnState,
} from "@/lib/galleryReturnState";
import {
  getSessionItem,
  setSessionItem,
} from "@/lib/sessionStorage";

gsap.registerPlugin(useGSAP, ScrollToPlugin);

const entranceStorageKey = "gallery-entrance-played-v2";

export function GalleryEntrance({ children }: { children: ReactNode }) {
  const gallery = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const root = gallery.current;
    if (!root) return;

    let entrance: gsap.core.Tween | undefined;
    let entranceFrame = 0;
    let positionFrame = 0;
    const previousScrollRestoration = history.scrollRestoration;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    history.scrollRestoration = "manual";
    document.documentElement.style.scrollBehavior = "auto";

    const returnState = readGalleryReturnState();
    if (returnState) {
      const tile = root.querySelector<HTMLElement>(
        `[data-photo-slug="${CSS.escape(returnState.slug)}"]`,
      );
      if (tile) {
        positionFrame = window.requestAnimationFrame(() => {
          const bounds = tile.getBoundingClientRect();
          const topInset =
            root.querySelector<HTMLElement>("[data-gallery-header]")
              ?.getBoundingClientRect().bottom
            ?? 0;
          const centeredScroll = window.scrollY
            + bounds.top
            - topInset
            - ((window.innerHeight - topInset - bounds.height) / 2);
          const maxScroll = Math.max(
            0,
            document.documentElement.scrollHeight - window.innerHeight,
          );
          const target = Number.isFinite(centeredScroll)
            ? Math.min(maxScroll, Math.max(0, centeredScroll))
            : returnState.scrollY;

          window.scrollTo(0, target);
          removeGalleryReturnState();
          history.scrollRestoration = previousScrollRestoration;
          document.documentElement.style.scrollBehavior = previousScrollBehavior;
        });

        return () => {
          window.cancelAnimationFrame(positionFrame);
          history.scrollRestoration = previousScrollRestoration;
          document.documentElement.style.scrollBehavior = previousScrollBehavior;
        };
      }
    }
    removeGalleryReturnState();

    if (getSessionItem(entranceStorageKey)) {
      history.scrollRestoration = previousScrollRestoration;
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top: 0 });
      setSessionItem(entranceStorageKey, "true");
      history.scrollRestoration = previousScrollRestoration;
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      return;
    }

    const interruptionEvents = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    const removeInterruptionListeners = () => {
      interruptionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, interruptEntrance);
      });
    };
    const restoreBrowserBehavior = () => {
      delete document.documentElement.dataset.galleryEntering;
      removeInterruptionListeners();
      history.scrollRestoration = previousScrollRestoration;
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    };
    const interruptEntrance = () => {
      window.cancelAnimationFrame(entranceFrame);
      entrance?.kill();
      setSessionItem(entranceStorageKey, "true");
      restoreBrowserBehavior();
    };

    const positionAtBottom = () => {
      const bottom = Math.max(0, root.offsetTop + root.scrollHeight - window.innerHeight);
      const start = Math.min(bottom, window.innerHeight * 0.9);
      if (start <= 1) {
        setSessionItem(entranceStorageKey, "true");
        restoreBrowserBehavior();
        return;
      }

      document.documentElement.dataset.galleryEntering = "true";
      window.scrollTo(0, start);

      interruptionEvents.forEach((eventName) => {
        window.addEventListener(eventName, interruptEntrance, { once: true, passive: true });
      });

      entranceFrame = window.requestAnimationFrame(() => {
        entrance = gsap.to(window, {
          scrollTo: { y: 0, autoKill: true },
          duration: 1,
          ease: "power2.inOut",
          onComplete: () => {
            setSessionItem(entranceStorageKey, "true");
            restoreBrowserBehavior();
          },
          onInterrupt: restoreBrowserBehavior,
        });
      });
    };

    positionFrame = window.requestAnimationFrame(positionAtBottom);

    return () => {
      window.cancelAnimationFrame(positionFrame);
      window.cancelAnimationFrame(entranceFrame);
      entrance?.kill();
      restoreBrowserBehavior();
    };
  }, { scope: gallery });

  return <div ref={gallery}>{children}</div>;
}
