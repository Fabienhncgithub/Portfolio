"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { InstagramLink } from "@/components/InstagramLink/InstagramLink";
import styles from "./SiteNavigation.module.scss";

export function SiteNavigation() {
  const pathname = usePathname();
  const isPhoto = pathname.startsWith("/photo/");

  return (
    <header className={styles.siteNavigation} data-hidden={isPhoto}>
      <Link
        aria-current={pathname === "/" ? "page" : undefined}
        aria-label="Fabien Hance, home"
        className={styles.wordmark}
        href="/"
      >
        <strong><span>Fabien</span><span>Hance</span></strong>
      </Link>
      <nav aria-label="Primary navigation">
        <Link
          aria-current={pathname === "/about" ? "page" : undefined}
          className={styles.aboutLink}
          href="/about"
        >
          About
        </Link>
      </nav>
      <InstagramLink className={styles.instagramLink} />
    </header>
  );
}
