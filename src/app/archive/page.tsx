import { PhotoArchiveGrid } from "@/components/PhotoArchiveGrid/PhotoArchiveGrid";
import { getPhotos } from "@/lib/photos";
import { pageMetadata } from "@/lib/site";
import styles from "./page.module.scss";

export const metadata = pageMetadata({
  title: "Archive",
  description: "Photography archive by Fabien Hance.",
  path: "/archive",
});

export default async function ArchivePage() {
  const photos = await getPhotos();
  return (
    <section className={styles.archivePage}>
      <h1>Archive</h1>
      <PhotoArchiveGrid photos={photos} />
    </section>
  );
}
