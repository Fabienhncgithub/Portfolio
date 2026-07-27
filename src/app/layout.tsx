import type { Metadata } from "next";
import { PhotoCursor } from "@/components/PhotoCursor/PhotoCursor";
import { SiteNavigation } from "@/components/SiteNavigation/SiteNavigation";
import "@/styles/base.scss";

export const metadata: Metadata = {
  title: {
    default: "Fabien Hance — Photographer",
    template: "%s — Fabien Hance",
  },
  description: "Photography by Fabien Hance.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <SiteNavigation />
        <PhotoCursor />
        <main>{children}</main>
        <footer>
          <span>© {new Date().getFullYear()} Fabien Hance</span>
        </footer>
      </body>
    </html>
  );
}
