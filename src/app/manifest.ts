import type { MetadataRoute } from "next";
import { siteDescription, siteName } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteName} — Photographer`,
    short_name: siteName,
    description: siteDescription,
    start_url: "/",
    display: "browser",
    background_color: "#f7f6f2",
    theme_color: "#f7f6f2",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
