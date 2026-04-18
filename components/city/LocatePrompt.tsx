"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function LocatePrompt({ locale }: { locale: string }) {
  const router = useRouter();
  const t = useTranslations("nearby");
  const [status, setStatus] = React.useState<
    "idle" | "prompting" | "denied" | "unsupported"
  >("idle");

  const request = React.useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      return;
    }
    setStatus("prompting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const url = new URL(window.location.href);
        url.searchParams.set("lat", pos.coords.latitude.toFixed(5));
        url.searchParams.set("lng", pos.coords.longitude.toFixed(5));
        router.replace(`${url.pathname}${url.search}`);
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: 5 * 60_000 }
    );
  }, [router]);

  return (
    <div className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-8 md:p-12">
      <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
        {t("eyebrow")}
      </p>
      <h1 className="mt-4 font-headline text-4xl text-primary md:text-5xl">
        {t("heading")}
      </h1>
      <p className="mt-4 max-w-2xl text-on-surface-variant">{t("lead")}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={request}
          disabled={status === "prompting"}
          className="rounded-sm border border-primary bg-primary px-4 py-2 text-[12px] uppercase tracking-[0.2em] text-on-primary transition hover:bg-primary/90 disabled:opacity-50"
        >
          {status === "prompting" ? t("prompting") : t("cta")}
        </button>
        <a
          href={`/${locale}/cities`}
          className="rounded-sm border border-outline/60 bg-surface px-4 py-2 text-[12px] uppercase tracking-[0.2em] text-on-surface hover:border-primary hover:text-primary"
        >
          {t("browseCities")}
        </a>
      </div>

      {status === "denied" && (
        <p className="mt-4 text-sm text-on-surface-variant">{t("denied")}</p>
      )}
      {status === "unsupported" && (
        <p className="mt-4 text-sm text-on-surface-variant">
          {t("unsupported")}
        </p>
      )}
    </div>
  );
}
