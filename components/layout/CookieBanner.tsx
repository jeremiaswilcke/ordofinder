"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "ordofinder.cookie-consent";
type Consent = "accepted" | "essential";

export function CookieBanner({ locale }: { locale: string }) {
  const t = useTranslations("cookieBanner");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function persist(choice: Consent) {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* ignore — fall back to session-only dismissal */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t("ariaLabel")}
      className="fixed inset-x-0 bottom-20 z-50 mx-auto max-w-3xl px-4 md:bottom-6 md:px-6"
    >
      <div className="rounded-lg border border-outline-variant bg-surface-container-high p-5 shadow-lg">
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">{t("eyebrow")}</p>
        <h2 className="mt-2 font-headline text-lg text-primary">{t("title")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          {t("body")}{" "}
          <Link href={`/${locale}/privacy`} className="underline">
            {t("privacyLink")}
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => persist("essential")}
            className="rounded bg-surface-container px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant transition-colors hover:bg-surface-container-highest"
          >
            {t("essentialOnly")}
          </button>
          <button
            type="button"
            onClick={() => persist("accepted")}
            className="rounded bg-primary px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-primary transition-colors hover:bg-primary-dim"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
