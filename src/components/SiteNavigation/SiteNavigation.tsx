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
      <Link className={styles.wordmark} href="/" aria-label="Fabien Hance, accueil">
        <strong><span>Fabien</span><span>Hance</span></strong>
      </Link>
      <nav aria-label="Navigation principale">
        <Link className={styles.aboutLink} href="/about">
          About
        </Link>
      </nav>
      <InstagramLink className={styles.instagramLink} />
    </header>
  );
}
