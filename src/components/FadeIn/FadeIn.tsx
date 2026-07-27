"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function FadeIn({
  children,
  delay = 0,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const element = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!element.current) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(element.current, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        element.current,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element.current,
            start: "top 92%",
            once: true,
          },
        },
      );
    },
    { scope: element, dependencies: [delay] },
  );

  return <div ref={element} className={className} style={style}>{children}</div>;
}
