"use client";

import { useEffect } from "react";
import "@/styles/base.scss";
import styles from "./not-found.module.scss";

// Replaces the root layout when the layout itself fails, so it renders its own document.
export default function GlobalError({
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
    <html lang="en">
      <body>
        <main>
          <section aria-labelledby="error-title" className={styles.notFoundPage}>
            <p className={styles.code}>Error</p>
            <h1 id="error-title">Something went wrong.</h1>
            <button className={styles.returnLink} onClick={reset} type="button">
              Try again
            </button>
            {/* A full page load is the point here: the app shell has crashed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a className={styles.secondaryLink} href="/">
              Back to the photographs
            </a>
          </section>
        </main>
      </body>
    </html>
  );
}
