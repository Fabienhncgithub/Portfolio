"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function PhotoKeyboardNavigation({
  previousHref,
  nextHref,
}: {
  previousHref?: string;
  nextHref?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    function navigate(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isEditing =
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT";

      if (isEditing || event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "Escape") {
        router.push("/");
      } else if (event.key === "ArrowLeft" && previousHref) {
        router.push(previousHref);
      } else if (event.key === "ArrowRight" && nextHref) {
        router.push(nextHref);
      } else {
        return;
      }

      event.preventDefault();
    }

    window.addEventListener("keydown", navigate);
    return () => window.removeEventListener("keydown", navigate);
  }, [nextHref, previousHref, router]);

  return null;
}
