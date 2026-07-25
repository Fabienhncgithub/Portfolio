"use client";

import { useState } from "react";
import type { Photo, PhotoCategory } from "@/lib/photos";
import { PhotoTile } from "./PhotoTile";

const filters: Array<"All" | PhotoCategory> = [
  "All",
  "Landscape",
  "City",
  "Travel",
  "Details",
];

export function ArchiveGrid({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState<(typeof filters)[number]>("All");
  const visible =
    active === "All" ? photos : photos.filter((photo) => photo.category === active);

  return (
    <>
      <div className="filters" aria-label="Filtrer les photographies">
        {filters.map((filter) => (
          <button
            aria-pressed={active === filter}
            className={active === filter ? "active" : ""}
            key={filter}
            onClick={() => setActive(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="archive-grid">
        {visible.map((photo, index) => (
          <PhotoTile
            className={index % 5 === 1 || index % 5 === 4 ? "portrait" : "landscape"}
            delay={(index % 3) * 0.08}
            key={photo.slug}
            photo={photo}
          />
        ))}
      </div>
    </>
  );
}
