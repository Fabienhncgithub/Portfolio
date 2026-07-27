import type { Metadata } from "next";
import { PhotoArchiveGrid } from "@/components/PhotoArchiveGrid/PhotoArchiveGrid";
import { getPhotos } from "@/lib/photos";
import styles from "./page.module.scss";

export const metadata: Metadata = { title: "Archive" };

export default async function ArchivePage() {
  const photos = await getPhotos();
  return (
    <section className={styles.archivePage}>
      <h1>Archive</h1>
      <PhotoArchiveGrid photos={photos} />
    </section>
  );
}
