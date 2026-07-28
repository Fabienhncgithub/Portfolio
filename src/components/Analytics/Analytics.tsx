"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import styles from "./Analytics.module.scss";

const consentStorageKey = "analytics-consent-v1";
const consentDialogEvent = "open-analytics-consent";

type Consent = "denied" | "granted";
type AnalyticsValue = boolean | number | string;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: "config" | "consent" | "event" | "js",
      target: string | Date,
      parameters?: Record<string, AnalyticsValue>,
    ) => void;
  }
}

function updateConsent(consent: Consent) {
  window.gtag?.("consent", "update", {
    ad_personalization: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    analytics_storage: consent,
  });
}

function loadGoogleAnalytics(measurementId: string, onReady: () => void) {
  window.dataLayer ??= [];
  window.gtag ??= function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  } as Window["gtag"];
  const gtag = window.gtag;
  if (!gtag) return;

  gtag("consent", "default", {
    ad_personalization: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    analytics_storage: "denied",
    wait_for_update: 500,
  });
  updateConsent("granted");

  const configure = () => {
    window.gtag?.("js", new Date());
    window.gtag?.("config", measurementId, {
      allow_ad_personalization_signals: false,
      allow_google_signals: false,
      send_page_view: false,
      transport_type: "beacon",
    });
    onReady();
  };

  const existingScript = document.querySelector<HTMLScriptElement>(
    `script[data-google-analytics="${measurementId}"]`,
  );
  if (existingScript) {
    if (existingScript.dataset.loaded === "true") configure();
    else existingScript.addEventListener("load", configure, { once: true });
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.dataset.googleAnalytics = measurementId;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  script.addEventListener("load", () => {
    script.dataset.loaded = "true";
    configure();
  }, { once: true });
  document.head.append(script);
}

function sendEvent(name: string, parameters: Record<string, AnalyticsValue> = {}) {
  window.gtag?.("event", name, parameters);
}

export function Analytics({ measurementId }: { measurementId?: string }) {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ready, setReady] = useState(false);

  const applyConsent = useCallback((nextConsent: Consent) => {
    localStorage.setItem(consentStorageKey, nextConsent);
    setConsent(nextConsent);
    setDialogOpen(false);

    if (nextConsent === "granted" && measurementId) {
      loadGoogleAnalytics(measurementId, () => setReady(true));
    } else {
      updateConsent("denied");
      setReady(false);
    }
  }, [measurementId]);

  useEffect(() => {
    if (!measurementId) return;

    const stored = localStorage.getItem(consentStorageKey);
    const initialConsent = stored === "granted" || stored === "denied"
      ? stored
      : undefined;
    setConsent(initialConsent);

    if (initialConsent === "granted") {
      loadGoogleAnalytics(measurementId, () => setReady(true));
    }

    const openDialog = () => setDialogOpen(true);
    window.addEventListener(consentDialogEvent, openDialog);
    return () => window.removeEventListener(consentDialogEvent, openDialog);
  }, [measurementId]);

  useEffect(() => {
    if (!ready || consent !== "granted") return;

    const frame = window.requestAnimationFrame(() => {
      sendEvent("page_view", {
        page_location: window.location.href,
        page_path: pathname,
        page_title: document.title,
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [consent, pathname, ready]);

  useEffect(() => {
    if (!ready || consent !== "granted") return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>("[data-analytics-event]");
      if (!link) return;

      const parameters = Object.fromEntries(
        Object.entries(link.dataset)
          .filter(([key, value]) => key.startsWith("analytics") && key !== "analyticsEvent" && value)
          .map(([key, value]) => [
            key.replace(/^analytics/, "").replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
            value as string,
          ]),
      );
      sendEvent(link.dataset.analyticsEvent ?? "link_click", parameters);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [consent, ready]);

  useEffect(() => {
    if (!ready || consent !== "granted" || !pathname.startsWith("/photo/")) return;

    const photoSlug = pathname.slice("/photo/".length);
    const thresholds = [10, 30];
    const sent = new Set<number>();
    let visibleSeconds = 0;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible" || !document.hasFocus()) return;

      visibleSeconds += 1;
      thresholds.forEach((threshold) => {
        if (visibleSeconds < threshold || sent.has(threshold)) return;
        sent.add(threshold);
        sendEvent("photo_engagement", {
          engagement_seconds: threshold,
          photo_slug: photoSlug,
        });
      });
    }, 1_000);

    return () => window.clearInterval(timer);
  }, [consent, pathname, ready]);

  if (!measurementId) return null;

  const showDialog = consent === undefined || dialogOpen;
  if (!showDialog) return null;

  return (
    <aside
      aria-label="Analytics preferences"
      aria-live="polite"
      className={styles.consent}
      role="dialog"
    >
      <p>
        Optional analytics help improve which photographs and interactions work best.
      </p>
      <div>
        <button onClick={() => applyConsent("denied")} type="button">
          No thanks
        </button>
        <button className={styles.accept} onClick={() => applyConsent("granted")} type="button">
          Allow analytics
        </button>
      </div>
    </aside>
  );
}

export function AnalyticsPreferencesButton() {
  return (
    <button
      className={styles.preferences}
      onClick={() => window.dispatchEvent(new Event(consentDialogEvent))}
      type="button"
    >
      Analytics settings
    </button>
  );
}
