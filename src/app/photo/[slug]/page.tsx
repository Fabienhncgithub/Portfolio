import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPhoto, getPhotos } from "@/lib/photos";

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

  return (
    <article className="photo-page">
      <div className="photo-detail-image">
        <Image
          alt={`${photo.title}, ${photo.location}`}
          fill
          priority
          sizes="100vw"
          src={photo.image}
        />
      </div>
      <div className="photo-meta">
        <div>
          <h1>{photo.title}</h1>
          <p>{photo.location}, {photo.year}</p>
        </div>
        <div>
          {photo.camera && <p>{photo.camera}</p>}
          {photo.film && <p>{photo.film}</p>}
        </div>
      </div>
      <nav className="photo-pagination" aria-label="Photographies adjacentes">
        <Link href={`/photo/${previous.slug}`}>← Previous</Link>
        <Link href={`/photo/${next.slug}`}>Next →</Link>
      </nav>
    </article>
  );
}
