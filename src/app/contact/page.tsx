import type { Metadata } from "next";
import { FadeIn } from "@/components/FadeIn/FadeIn";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contacter Fabien Hance pour une commande, un tirage ou une collaboration.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className={styles.contactPage}>
      <FadeIn>
        <p className={styles.eyebrow}>Contact</p>
        <h1>For commissions, prints or a conversation.</h1>
        <a className={styles.emailLink} href="mailto:hello@fabienhance.com">
          hello@fabienhance.com
        </a>
      </FadeIn>
    </section>
  );
}
