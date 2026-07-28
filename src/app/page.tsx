import { GalleryEntrance } from "@/components/GalleryEntrance/GalleryEntrance";
import { PhotoGrid } from "@/components/PhotoGrid/PhotoGrid";
import { getPhotos } from "@/lib/photos";
import styles from "./page.module.scss";

export default async function Home() {
  const photos = await getPhotos();

  return (
    <GalleryEntrance>
      <div className={styles.homePage}>
        <h1 className="visually-hidden">Fabien Hance — Photography portfolio</h1>
        <PhotoGrid photos={photos} />
      </div>
    </GalleryEntrance>
  );
}
