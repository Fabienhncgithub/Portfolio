import Link from "next/link";
import styles from "./not-found.module.scss";

export default function NotFound() {
  return (
    <section aria-labelledby="not-found-title" className={styles.notFoundPage}>
      <p className={styles.code}>404</p>
      <h1 id="not-found-title">Page not found.</h1>
      <Link className={styles.returnLink} href="/">
        Back to the photographs
      </Link>
    </section>
  );
}
