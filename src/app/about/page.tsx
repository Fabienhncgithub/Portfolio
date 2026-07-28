import { FadeIn } from "@/components/FadeIn/FadeIn";
import { InstagramLink } from "@/components/InstagramLink/InstagramLink";
import { LiquidHeading } from "@/components/LiquidHeading/LiquidHeading";
import { pageMetadata } from "@/lib/site";
import styles from "./page.module.scss";

export const metadata = pageMetadata({
  title: "About",
  description:
    "A personal archive of landscapes, mountain trails and everyday moments.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <section className={styles.aboutPage}>
      <FadeIn>
        <p className={styles.eyebrow}>About</p>
        <LiquidHeading>
          A personal archive of landscapes, mountain trails and everyday moments.
        </LiquidHeading>
      </FadeIn>
      <FadeIn className={styles.copy}>
        <div>
          <LiquidHeading as="p">
            I rarely head out with a plan. Most of these photographs were taken while travelling, hiking or simply enjoying the moment. Film whenever I can, digital when I need to.
          </LiquidHeading>
        </div>
      </FadeIn>
      <InstagramLink className={styles.mobileInstagram} />
    </section>
  );
}
