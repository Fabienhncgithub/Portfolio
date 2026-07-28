import { FadeIn } from "@/components/FadeIn/FadeIn";
import { pageMetadata } from "@/lib/site";
import styles from "./page.module.scss";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Contact Fabien Hance for commissions, prints or collaborations.",
  path: "/contact",
});

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
