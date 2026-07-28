import type { Metadata } from "next";
import {
  Analytics,
  AnalyticsPreferencesButton,
} from "@/components/Analytics/Analytics";
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
    locale: "en_GB",
    url: "/",
    siteName,
    title: "Fabien Hance — Photographer",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Fabien Hance — Photographer",
    description: siteDescription,
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
  const configuredMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (
    configuredMeasurementId
    && !/^G-[A-Z0-9]+$/.test(configuredMeasurementId)
  ) {
    throw new Error("NEXT_PUBLIC_GA_MEASUREMENT_ID must use the G-XXXXXXXXXX format.");
  }
  const measurementId = configuredMeasurementId && /^G-[A-Z0-9]+$/.test(configuredMeasurementId)
    ? configuredMeasurementId
    : undefined;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        url: absoluteUrl(),
        name: siteName,
        description: siteDescription,
        inLanguage: "en",
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
    <html lang="en">
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
          {measurementId && <AnalyticsPreferencesButton />}
        </footer>
        <Analytics measurementId={measurementId} />
      </body>
    </html>
  );
}
