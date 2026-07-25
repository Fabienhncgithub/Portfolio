import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <section className="page about-page">
      <Reveal>
        <p className="eyebrow">About</p>
        <h1>
          I photograph quiet moments,
          <br />
          spaces and passing light.
        </h1>
      </Reveal>
      <div className="about-copy">
        <Reveal>
          <p>
            Based between Geneva and Brussels. My work moves through landscape,
            architecture and the incidental details found while travelling.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <p>
            Full-stack developer working with React, Next.js, TypeScript and .NET.
          </p>
        </Reveal>
      </div>
      <Reveal className="technical-note">
        <div><span>Frontend</span><p>Next.js / React / TypeScript</p></div>
        <div><span>CMS</span><p>Strapi</p></div>
        <div><span>Backend</span><p>.NET / REST APIs</p></div>
      </Reveal>
    </section>
  );
}
