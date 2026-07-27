import type { Metadata } from "next";
import { FadeIn } from "@/components/FadeIn/FadeIn";
import { InstagramLink } from "@/components/InstagramLink/InstagramLink";
import styles from "./page.module.scss";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <section className={styles.aboutPage}>
      <FadeIn>
        <p className={styles.eyebrow}>About</p>
        <h1>
          I photograph quiet moments,
          <br />
          spaces and passing light.
        </h1>
      </FadeIn>
      <div className={styles.copy}>
        <FadeIn>
          <p>
            My work moves through landscape, architecture and the incidental
            details found while travelling.
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p>
            Full-stack developer working with React, Next.js, TypeScript and .NET.
          </p>
        </FadeIn>
      </div>
      <FadeIn className={styles.technicalNote}>
        <div><span>Frontend</span><p>Next.js / React / TypeScript</p></div>
        <div><span>CMS</span><p>Strapi</p></div>
        <div><span>Backend</span><p>.NET / REST APIs</p></div>
      </FadeIn>
      <InstagramLink className={styles.mobileInstagram} />
    </section>
  );
}
