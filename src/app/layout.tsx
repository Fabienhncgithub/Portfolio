import type { Metadata } from "next";
import { PhotoCursor } from "@/components/PhotoCursor/PhotoCursor";
import { SiteNavigation } from "@/components/SiteNavigation/SiteNavigation";
import { absoluteUrl, siteDescription, siteName, siteUrl } from "@/lib/site";
import "@/styles/base.scss";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Fabien Hance — Photographer",
    template: "%s — Fabien Hance",
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  category: "photography",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_CH",
    url: "/",
    siteName,
    title: "Fabien Hance — Photographer",
    description: siteDescription,
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fabien Hance — Photographer",
    description: siteDescription,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        url: absoluteUrl(),
        name: siteName,
        description: siteDescription,
        inLanguage: "fr",
      },
      {
        "@type": "Person",
        "@id": absoluteUrl("/#person"),
        name: siteName,
        url: absoluteUrl(),
        jobTitle: "Photographer",
      },
    ],
  };

  return (
    <html lang="fr">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
          type="application/ld+json"
        />
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
