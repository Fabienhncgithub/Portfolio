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
      <FadeIn className={styles.intro}>
        <LiquidHeading>
          A personal archive of landscapes, mountain trails and everyday moments.
        </LiquidHeading>
      </FadeIn>
      <FadeIn className={styles.copy}>
        <div>
          <LiquidHeading as="p">
            An evolving collection of photographs gathered along the way. No projects or themes, just places, light and moments worth keeping. Mostly film, occasionally digital.
          </LiquidHeading>
        </div>
      </FadeIn>
      <InstagramLink className={styles.mobileInstagram} />
    </section>
  );
}
