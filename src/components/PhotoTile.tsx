import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/lib/photos";
import { Reveal } from "./Reveal";

export function PhotoTile({
  photo,
  className = "",
  priority = false,
  delay = 0,
}: {
  photo: Photo;
  className?: string;
  priority?: boolean;
  delay?: number;
}) {
  return (
    <Reveal className={`photo-tile ${className}`} delay={delay}>
      <Link href={`/photo/${photo.slug}`} aria-label={`Voir ${photo.title}`}>
        <figure>
          <div className="photo-frame">
            <Image
              alt={`${photo.title}, ${photo.location}`}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, 80vw"
              src={photo.image}
            />
          </div>
          <figcaption>
            <span>{photo.location}</span>
            <span>{photo.year}</span>
          </figcaption>
        </figure>
      </Link>
    </Reveal>
  );
}
