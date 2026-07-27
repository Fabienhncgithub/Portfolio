export type PhotoCategory = "Landscape" | "City" | "Travel" | "Details";

export type Photo = {
  slug: string;
  title: string;
  location: string;
  year: number;
  category: PhotoCategory;
  image: string;
  width: number;
  height: number;
  camera?: string;
  film?: string;
};
