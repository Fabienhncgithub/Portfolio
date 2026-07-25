import { PhotoTile } from "@/components/PhotoTile";
import { Reveal } from "@/components/Reveal";
import { getPhotos } from "@/lib/photos";

export default async function Home() {
  const photos = await getPhotos();

  return (
    <>
      <section className="hero">
        <PhotoTile className="hero-photo" photo={photos[0]} priority />
      </section>

      <Reveal className="intro">
        <p>
          Photographer / Full-stack developer
          <br />
          Geneva — Brussels
        </p>
      </Reveal>

      <section className="editorial-grid" aria-label="Sélection de photographies">
        <PhotoTile className="editorial-a portrait" photo={photos[1]} />
        <PhotoTile className="editorial-b landscape" photo={photos[2]} />
        <PhotoTile className="editorial-c portrait" photo={photos[3]} />
        <PhotoTile className="editorial-d landscape" photo={photos[4]} />
        <PhotoTile className="editorial-e portrait" photo={photos[5]} />
        <PhotoTile className="editorial-f landscape" photo={photos[6]} />
        <PhotoTile className="editorial-g portrait" photo={photos[7]} />
      </section>
    </>
  );
}
