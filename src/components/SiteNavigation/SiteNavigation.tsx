"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SiteNavigation.module.scss";

export function SiteNavigation() {
  const pathname = usePathname();
  const isPhoto = pathname.startsWith("/photo/");

  return (
    <header className={styles.siteNavigation} data-hidden={isPhoto}>
      <Link className={styles.wordmark} href="/" aria-label="Fabien Hance, accueil">
        <strong><span>Fabien</span><span>Hance</span></strong>
      </Link>
      <nav aria-label="Navigation principale">
        <Link className={styles.aboutLink} href="/about">
          About
        </Link>
      </nav>
      <a
        className={styles.instagramLink}
        aria-label="Instagram"
        href="https://www.instagram.com/"
        rel="noreferrer"
        target="_blank"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.4" cy="6.7" r="1" className={styles.instagramDot} />
        </svg>
      </a>
    </header>
  );
}
