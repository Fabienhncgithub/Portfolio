"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { MouseEvent } from "react";
import { useRef } from "react";
import styles from "./PhotoEntrance.module.scss";

gsap.registerPlugin(useGSAP);

export function PhotoEntrance({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const container = useRef<HTMLDivElement>(null);
  const closeCursor = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const image = container.current?.querySelector("img");
    if (!image || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.fromTo(
      image,
      { autoAlpha: 0, scale: 0.995 },
      { autoAlpha: 1, scale: 1, duration: 0.7, ease: "power3.out" },
    );

    const savedPointer = sessionStorage.getItem("photo-pointer-position");
    if (!savedPointer || !closeCursor.current || !window.matchMedia("(hover: hover)").matches) return;

    try {
      const pointer = JSON.parse(savedPointer) as { x: number; y: number; at: number };
      const link = closeCursor.current.closest("a");
      const bounds = link?.getBoundingClientRect();

      if (bounds && Date.now() - pointer.at < 2000) {
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
      sessionStorage.removeItem("photo-pointer-position");
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
    if (!closeCursor.current || !window.matchMedia("(hover: hover)").matches) return;

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
        aria-label="Retour à toutes les photographies"
        className={`${className ?? ""} ${styles.photoLink}`}
        href="/"
        onMouseEnter={(event) => {
          moveCloseCursor(event, true);
          setCloseCursorVisibility(true);
        }}
        onMouseLeave={() => setCloseCursorVisibility(false)}
        onMouseMove={moveCloseCursor}
        style={style}
      >
        {children}
        <span className={styles.closeCursor} ref={closeCursor} aria-hidden="true" />
      </Link>
    </div>
  );
}
