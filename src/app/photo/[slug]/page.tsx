import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PhotoEntrance } from "@/components/PhotoEntrance/PhotoEntrance";
import { PhotoKeyboardNavigation } from "@/components/PhotoKeyboardNavigation/PhotoKeyboardNavigation";
import { getPhoto, getPhotos } from "@/lib/photos";
import styles from "./page.module.scss";

export async function generateStaticParams() {
  const photos = await getPhotos();
  return photos.map(({ slug }) => ({ slug }));
}

export default async function PhotoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [photo, photos] = await Promise.all([getPhoto(slug), getPhotos()]);
  if (!photo) notFound();

  const index = photos.findIndex((item) => item.slug === slug);
  const previous = photos[(index - 1 + photos.length) % photos.length];
  const next = photos[(index + 1) % photos.length];
  const hasAdjacentPhotos = photos.length > 1;

  return (
    <article className={styles.photoPage} data-photo-page>
      <PhotoKeyboardNavigation
        previousHref={hasAdjacentPhotos ? `/photo/${previous.slug}` : undefined}
        nextHref={hasAdjacentPhotos ? `/photo/${next.slug}` : undefined}
      />
      <Link
        aria-label="Fermer la photographie et revenir à la galerie"
        className={styles.closePhoto}
        href="/"
      >
        <span aria-hidden="true" />
      </Link>
      <PhotoEntrance
        className={styles.photo}
        style={{ "--photo-detail-ratio": `${photo.width} / ${photo.height}` } as React.CSSProperties}
      >
        <Image
          alt={`${photo.title}, ${photo.location}`}
          fill
          priority
          sizes="100vw"
          src={photo.image}
        />
      </PhotoEntrance>
      <nav className={styles.pagination} aria-label="Photographies adjacentes">
        {hasAdjacentPhotos && (
          <span className={styles.adjacent}>
            <Link className={styles.previous} href={`/photo/${previous.slug}`}>
              <span aria-hidden="true">←</span>
              Previous
            </Link>
            <Link className={styles.next} href={`/photo/${next.slug}`}>
              Next
              <span aria-hidden="true">→</span>
            </Link>
          </span>
        )}
      </nav>
      <div className={styles.meta}>
        <div>
          <h1>{photo.title}</h1>
          <p>{photo.location}, {photo.year}</p>
        </div>
        <div>
          {photo.camera && <p>{photo.camera}</p>}
          {photo.film && <p>{photo.film}</p>}
        </div>
      </div>
    </article>
  );
}
