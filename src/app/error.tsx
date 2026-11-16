"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "./not-found.module.scss";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section aria-labelledby="error-title" className={styles.notFoundPage}>
      <p className={styles.code}>Error</p>
      <h1 id="error-title">Something went wrong.</h1>
      <button className={styles.returnLink} onClick={reset} type="button">
        Try again
      </button>
      <Link className={styles.secondaryLink} href="/">
        Back to the photographs
      </Link>
    </section>
  );
}
