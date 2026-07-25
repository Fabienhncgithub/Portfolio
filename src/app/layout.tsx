import type { Metadata } from "next";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Fabien Hance — Photographer",
    template: "%s — Fabien Hance",
  },
  description: "Photography by Fabien Hance, between Geneva and Brussels.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main>{children}</main>
        <footer>
          <span>© {new Date().getFullYear()} Fabien Hance</span>
          <span>Geneva — Brussels</span>
        </footer>
      </body>
    </html>
  );
}
