import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="page contact-page">
      <Reveal>
        <p className="eyebrow">Contact</p>
        <h1>For commissions, prints or a conversation.</h1>
        <a className="email-link" href="mailto:hello@fabienhance.com">
          hello@fabienhance.com
        </a>
      </Reveal>
    </section>
  );
}
