import { GalleryEntrance } from "@/components/GalleryEntrance/GalleryEntrance";
import { PhotoGrid } from "@/components/PhotoGrid/PhotoGrid";
import { getPhotos } from "@/lib/photos";
import styles from "./page.module.scss";

export default async function Home() {
  const photos = await getPhotos();

  return (
    <GalleryEntrance>
      <div className={styles.homePage}>
        <PhotoGrid photos={photos} />
      </div>
    </GalleryEntrance>
  );
}
