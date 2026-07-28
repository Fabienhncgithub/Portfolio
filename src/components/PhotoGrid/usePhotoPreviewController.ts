"use client";

import gsap from "gsap";
import type { RefObject } from "react";
import { useCallback, useEffect, useRef } from "react";
import type { Photo } from "@/lib/photos";
import {
  DESKTOP_COLOR_PREVIEW_DELAY,
  PRECISE_POINTER_QUERY,
  REDUCED_MOTION_QUERY,
} from "./constants";
import { dominantColor } from "./dominantColor";

type PhotoPreviewControllerOptions = {
  grid: RefObject<HTMLElement>;
  gridHeader: RefObject<HTMLDivElement>;
  gridMeta: RefObject<HTMLDivElement>;
  onActivePhotoChange: (photo: Photo) => void;
};

function reducedMotionRequested() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function usePhotoPreviewController({
  grid,
  gridHeader,
  gridMeta,
  onActivePhotoChange,
}: PhotoPreviewControllerOptions) {
  const activePhoto = useRef<Photo>();
  const activeSlug = useRef("");
  const colorHeaderForActivePhoto = useRef(false);
  const dwellTimer = useRef<ReturnType<typeof setTimeout>>();
  const previewWasRevealed = useRef(false);
  const titleAnimationFrame = useRef(0);

  const clearDwellTimer = useCallback(() => {
    if (!dwellTimer.current) return;
    clearTimeout(dwellTimer.current);
    dwellTimer.current = undefined;
  }, []);

  const hideColorLayers = useCallback((touchPreview: boolean) => {
    const layers = [
      ...(grid.current?.querySelectorAll<HTMLElement>("[data-photo-color-layer]") ?? []),
    ];
    gsap.killTweensOf(layers);
    if (gridHeader.current) gsap.killTweensOf(gridHeader.current);

    if (reducedMotionRequested()) {
      gsap.set(layers, { autoAlpha: 0 });
      if (gridHeader.current) {
        gsap.set(gridHeader.current, {
          backgroundColor: "#f7f6f2",
          color: "#181817",
        });
      }
      return;
    }

    if (layers.length) {
      gsap.to(layers, {
        autoAlpha: 0,
        duration: touchPreview ? 0.45 : 0.75,
        ease: "power3.out",
        stagger: touchPreview ? 0 : { each: 0.025, from: "random" },
        overwrite: true,
      });
    }
    if (gridHeader.current) {
      gsap.to(gridHeader.current, {
        backgroundColor: "#f7f6f2",
        color: "#181817",
        duration: touchPreview ? 0.45 : 0.75,
        ease: "power3.out",
        overwrite: true,
      });
    }
  }, [grid, gridHeader]);

  const clearColorPreview = useCallback(() => {
    const hadPreview = Boolean(activeSlug.current || dwellTimer.current);
    const wasTouchPreview = colorHeaderForActivePhoto.current;
    activePhoto.current = undefined;
    activeSlug.current = "";
    colorHeaderForActivePhoto.current = false;
    previewWasRevealed.current = false;
    clearDwellTimer();
    if (hadPreview) hideColorLayers(wasTouchPreview);
  }, [clearDwellTimer, hideColorLayers]);

  const revealColorBlocks = useCallback((photo: Photo, colorHeader: boolean) => {
    const mutedLayers: Array<{ color: string; layer: HTMLElement }> = [];

    grid.current?.querySelectorAll<HTMLElement>("[data-photo-slug]").forEach((tile) => {
      const layer = tile.querySelector<HTMLElement>("[data-photo-color-layer]");
      const tileImage = tile.querySelector<HTMLImageElement>("[data-photo-image]");
      const isActive = tile.dataset.photoSlug === photo.slug;

      if (isActive) return;

      if (layer && tileImage) {
        const color = dominantColor(tileImage);
        if (color) mutedLayers.push({ color, layer });
      }
    });

    const layers = mutedLayers.map(({ layer }) => layer);
    gsap.killTweensOf(layers);
    if (layers.length) {
      gsap.set(layers, {
        backgroundColor: (index) => mutedLayers[index].color,
      });
    }

    if (reducedMotionRequested()) {
      gsap.set(layers, { autoAlpha: 1 });
      return;
    }

    if (layers.length) {
      gsap.to(layers, {
        autoAlpha: 1,
        duration: colorHeader ? 0.45 : 0.75,
        ease: colorHeader ? "power3.out" : "power2.inOut",
        stagger: colorHeader ? 0 : { each: 0.018, from: "random" },
        overwrite: true,
      });
    }
  }, [grid]);

  const scheduleColorBlocks = useCallback((
    photo: Photo,
    delay: number,
    colorHeader = false,
  ) => {
    clearDwellTimer();
    activePhoto.current = photo;
    activeSlug.current = photo.slug;
    colorHeaderForActivePhoto.current = colorHeader;
    previewWasRevealed.current = false;
    dwellTimer.current = setTimeout(() => {
      dwellTimer.current = undefined;
      if (activeSlug.current === photo.slug) {
        previewWasRevealed.current = true;
        revealColorBlocks(photo, colorHeader);
      }
    }, delay);
  }, [clearDwellTimer, revealColorBlocks]);

  const animateTitleIn = useCallback(() => {
    const element = gridMeta.current;
    if (!element) return;

    window.cancelAnimationFrame(titleAnimationFrame.current);
    titleAnimationFrame.current = window.requestAnimationFrame(() => {
      titleAnimationFrame.current = 0;

      if (reducedMotionRequested()) {
        gsap.set(element, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        element,
        { autoAlpha: 0, y: 5 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.28,
          ease: "power3.out",
          overwrite: true,
        },
      );
    });
  }, [gridMeta]);

  const hideTitle = useCallback(() => {
    window.cancelAnimationFrame(titleAnimationFrame.current);
    titleAnimationFrame.current = 0;

    const element = gridMeta.current;
    if (!element) return;

    gsap.killTweensOf(element);
    if (reducedMotionRequested()) {
      gsap.set(element, { autoAlpha: 0, y: -4 });
      return;
    }

    gsap.to(element, {
      autoAlpha: 0,
      y: -4,
      duration: 0.18,
      ease: "power2.out",
      overwrite: true,
    });
  }, [gridMeta]);

  const startPreview = useCallback((photo: Photo) => {
    if (!window.matchMedia(PRECISE_POINTER_QUERY).matches) {
      onActivePhotoChange(photo);
      return;
    }

    if (activeSlug.current === photo.slug) return;
    clearColorPreview();
    activeSlug.current = photo.slug;
    onActivePhotoChange(photo);
    animateTitleIn();
    scheduleColorBlocks(photo, DESKTOP_COLOR_PREVIEW_DELAY);
  }, [
    animateTitleIn,
    clearColorPreview,
    onActivePhotoChange,
    scheduleColorBlocks,
  ]);

  const endPreview = useCallback(() => {
    if (!window.matchMedia(PRECISE_POINTER_QUERY).matches) return;
    if (!activeSlug.current && !dwellTimer.current) return;

    clearColorPreview();
    hideTitle();
  }, [clearColorPreview, hideTitle]);

  const activateTouchPreview = useCallback((photo: Photo) => {
    clearColorPreview();
    onActivePhotoChange(photo);
    scheduleColorBlocks(photo, 0, true);
  }, [clearColorPreview, onActivePhotoChange, scheduleColorBlocks]);

  useEffect(() => {
    const precisePointer = window.matchMedia(PRECISE_POINTER_QUERY);
    const handleCapabilityChange = () => {
      if (!precisePointer.matches) {
        clearColorPreview();
        hideTitle();
      }
    };

    precisePointer.addEventListener("change", handleCapabilityChange);
    return () => precisePointer.removeEventListener("change", handleCapabilityChange);
  }, [clearColorPreview, hideTitle]);

  useEffect(() => {
    const gridElement = grid.current;
    if (!gridElement) return;

    const revealNewlyLoadedColor = (event: Event) => {
      if (
        !(event.target instanceof HTMLImageElement)
        || !previewWasRevealed.current
        || !activePhoto.current
      ) return;

      revealColorBlocks(
        activePhoto.current,
        colorHeaderForActivePhoto.current,
      );
    };

    gridElement.addEventListener("load", revealNewlyLoadedColor, true);
    return () => gridElement.removeEventListener("load", revealNewlyLoadedColor, true);
  }, [grid, revealColorBlocks]);

  useEffect(() => () => {
    clearDwellTimer();
    window.cancelAnimationFrame(titleAnimationFrame.current);

    const layers = grid.current?.querySelectorAll("[data-photo-color-layer]");
    if (layers) gsap.killTweensOf([...layers]);
    if (gridHeader.current) gsap.killTweensOf(gridHeader.current);
    if (gridMeta.current) gsap.killTweensOf(gridMeta.current);
  }, [clearDwellTimer, grid, gridHeader, gridMeta]);

  return {
    activateTouchPreview,
    clearColorPreview,
    endPreview,
    startPreview,
  };
}
