import type { Photo } from "@/lib/photos";
import { PhotoTile } from "@/components/PhotoTile/PhotoTile";
import styles from "./PhotoArchiveGrid.module.scss";

export function PhotoArchiveGrid({ photos }: { photos: Photo[] }) {
  if (!photos.length) {
    return <p className={styles.emptyState}>No photographs published.</p>;
  }

  return (
    <div className={styles.archiveGrid}>
      {photos.map((photo, index) => (
        <PhotoTile
          className={index % 5 === 1 || index % 5 === 4 ? styles.portrait : styles.landscape}
          delay={(index % 3) * 0.08}
          key={photo.slug}
          photo={photo}
          sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1199px) calc(50vw - 2.5rem), (max-width: 1919px) calc(33vw - 2rem), 24vw"
        />
      ))}
    </div>
  );
}
