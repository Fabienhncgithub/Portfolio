"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import styles from "./ScrollIndicator.module.scss";

gsap.registerPlugin(useGSAP);

export function ScrollIndicator() {
  const [visible, setVisible] = useState(true);
  const indicator = useRef<HTMLButtonElement>(null);
  const progress = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => setVisible(window.scrollY < 40);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useGSAP(() => {
    if (!progress.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.fromTo(
      progress.current,
      { xPercent: -110 },
      {
        xPercent: 310,
        duration: 2.2,
        ease: "power2.inOut",
        repeat: -1,
        repeatDelay: 0.2,
      },
    );
  }, { scope: indicator });

  useGSAP(() => {
    if (!indicator.current) return;
    gsap.to(indicator.current, {
      autoAlpha: visible ? 1 : 0,
      duration: 0.35,
      ease: "power2.out",
      overwrite: true,
    });
  }, { scope: indicator, dependencies: [visible] });

  function beginScroll() {
    window.scrollTo({ top: window.innerHeight * 0.72, behavior: "smooth" });
  }

  return (
    <button
      className={styles.scrollIndicator}
      ref={indicator}
      type="button"
      onClick={beginScroll}
      aria-label="Commencer à parcourir les photographies"
    >
      <span>Scroll</span>
      <i aria-hidden="true"><b ref={progress} /></i>
      <span>View</span>
    </button>
  );
}
