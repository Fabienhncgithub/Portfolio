import type { Photo } from "@/lib/photos";
import { PhotoTile } from "@/components/PhotoTile/PhotoTile";
import styles from "./PhotoArchiveGrid.module.scss";

export function PhotoArchiveGrid({ photos }: { photos: Photo[] }) {
  return (
    <div className={styles.archiveGrid}>
      {photos.map((photo, index) => (
        <PhotoTile
          className={index % 5 === 1 || index % 5 === 4 ? styles.portrait : styles.landscape}
          delay={(index % 3) * 0.08}
          key={photo.slug}
          photo={photo}
        />
      ))}
    </div>
  );
}
