import type { Metadata } from "next";
import { ArchiveGrid } from "@/components/ArchiveGrid";
import { getPhotos } from "@/lib/photos";

export const metadata: Metadata = { title: "Archive" };

export default async function ArchivePage() {
  const photos = await getPhotos();
  return (
    <section className="page archive-page">
      <h1>Archive</h1>
      <ArchiveGrid photos={photos} />
    </section>
  );
}
