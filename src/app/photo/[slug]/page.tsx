import Image, { getImageProps } from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PhotoEntrance } from "@/components/PhotoEntrance/PhotoEntrance";
import { PhotoKeyboardNavigation } from "@/components/PhotoKeyboardNavigation/PhotoKeyboardNavigation";
import { getPhoto, getPhotos } from "@/lib/photos";
import { siteName } from "@/lib/site";
import styles from "./page.module.scss";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const photo = await getPhoto(slug);
  if (!photo) return {};

  const description = [
    photo.title,
    photo.location,
    photo.year ? String(photo.year) : undefined,
    `photograph by ${siteName}`,
  ].filter(Boolean).join(" — ");

  return {
    title: photo.title,
    description,
    alternates: { canonical: `/photo/${photo.slug}` },
    openGraph: {
      type: "article",
      url: `/photo/${photo.slug}`,
      siteName,
      locale: "en_GB",
      title: photo.title,
      description,
      images: [{
        url: photo.image,
        width: photo.width,
        height: photo.height,
        alt: photo.alt,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: photo.title,
      description,
      images: [photo.image],
    },
  };
}

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
  const photos = await getPhotos();
  const photo = photos.find((item) => item.slug === slug);
  if (!photo) notFound();

  const index = photos.findIndex((item) => item.slug === slug);
  const previous = photos[(index - 1 + photos.length) % photos.length];
  const next = photos[(index + 1) % photos.length];
  const hasAdjacentPhotos = photos.length > 1;
  const preloadImage = (image: string) => {
    const { props } = getImageProps({
      alt: "",
      fill: true,
      sizes: "100vw",
      src: image,
    });

    return {
      sizes: props.sizes,
      src: props.src,
      srcSet: props.srcSet,
    };
  };
  const locationDetails = [
    photo.location,
    photo.year ? String(photo.year) : undefined,
  ].filter(Boolean).join(", ");

  return (
    <article className={styles.photoPage} data-photo-page data-photo-slug={photo.slug}>
      <h1 className="visually-hidden">{photo.title}</h1>
      <PhotoKeyboardNavigation
        currentSlug={photo.slug}
        previousHref={hasAdjacentPhotos ? `/photo/${previous.slug}` : undefined}
        nextHref={hasAdjacentPhotos ? `/photo/${next.slug}` : undefined}
        previousImage={hasAdjacentPhotos ? preloadImage(previous.image) : undefined}
        nextImage={hasAdjacentPhotos ? preloadImage(next.image) : undefined}
        swipeSurfaceId="photo-swipe-surface"
      />
      <Link
        aria-label="Close the photograph and return to the gallery"
        className={styles.closePhoto}
        data-analytics-event="gallery_return"
        data-analytics-method="close"
        href="/"
      >
        <span aria-hidden="true" />
      </Link>
      <div id="photo-swipe-surface">
        <PhotoEntrance
          key={photo.slug}
          className={styles.photo}
          style={{ "--photo-detail-ratio": `${photo.width} / ${photo.height}` } as React.CSSProperties}
        >
          <Image
            alt={photo.alt}
            fill
            priority
            sizes="100vw"
            src={photo.image}
          />
        </PhotoEntrance>
      </div>
      <nav className={styles.pagination} aria-label="Adjacent photographs">
        {hasAdjacentPhotos && (
          <span className={styles.adjacent}>
            <Link
              className={styles.previous}
              data-analytics-direction="previous"
              data-analytics-event="photo_navigation"
              data-analytics-photo-slug={previous.slug}
              href={`/photo/${previous.slug}`}
            >
              <span aria-hidden="true">←</span>
              Previous
            </Link>
            <Link
              className={styles.next}
              data-analytics-direction="next"
              data-analytics-event="photo_navigation"
              data-analytics-photo-slug={next.slug}
              href={`/photo/${next.slug}`}
            >
              Next
              <span aria-hidden="true">→</span>
            </Link>
          </span>
        )}
      </nav>
      <div className={styles.meta}>
        <div>
          <p className={styles.title}>{photo.title}</p>
          {locationDetails && <p>{locationDetails}</p>}
        </div>
        <div>
          {photo.camera && <p>{photo.camera}</p>}
          {photo.film && <p>{photo.film}</p>}
        </div>
      </div>
    </article>
  );
}
