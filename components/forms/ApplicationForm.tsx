"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

type Props = {
  defaultDisplayName?: string;
  locale: string;
  onSuccessHref: string;
};

export function ApplicationForm({
  defaultDisplayName = "",
  locale,
  onSuccessHref,
}: Props) {
  const t = useTranslations("apply");
  const [form, setForm] = React.useState({
    displayName: defaultDisplayName,
    about: "",
    motivation: "",
    preferredCountryCode: "",
    preferredSubdivisionCode: "",
  });
  const [status, setStatus] = React.useState<
    "idle" | "sending" | "ok" | "error"
  >("idle");
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName,
          about: form.about,
          motivation: form.motivation,
          preferredCountryCode: form.preferredCountryCode
            ? form.preferredCountryCode.toUpperCase()
            : undefined,
          preferredSubdivisionCode: form.preferredSubdivisionCode || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "submission_failed");
      }

      setStatus("ok");
      setTimeout(() => {
        window.location.href = onSuccessHref;
      }, 1500);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "unknown");
    }
  }

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const fieldCls =
    "w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-on-surface focus:border-primary focus:outline-none";

  function errorSuffix(): string {
    if (error === "application_already_pending") return t("errorAlreadyPending");
    if (error === "already_has_role") return t("errorAlreadyRole");
    if (error === "unauthenticated") return t("errorUnauthenticated");
    return t("errorGeneric");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">
          {t("formDisplayName")}
        </label>
        <input
          className={fieldCls}
          value={form.displayName}
          onChange={(e) => update("displayName", e.target.value)}
          placeholder={t("formDisplayNamePlaceholder")}
          required
          minLength={2}
          maxLength={120}
        />
      </div>

      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">
          {t("formAbout")}
        </label>
        <textarea
          className={`${fieldCls} min-h-32 resize-y`}
          value={form.about}
          onChange={(e) => update("about", e.target.value)}
          placeholder={t("formAboutPlaceholder")}
          required
          minLength={10}
          maxLength={2000}
        />
      </div>

      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">
          {t("formMotivation")}
        </label>
        <textarea
          className={`${fieldCls} min-h-32 resize-y`}
          value={form.motivation}
          onChange={(e) => update("motivation", e.target.value)}
          placeholder={t("formMotivationPlaceholder")}
          required
          minLength={10}
          maxLength={2000}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">
            {t("formCountry")}
          </label>
          <input
            className={fieldCls}
            value={form.preferredCountryCode}
            onChange={(e) =>
              update("preferredCountryCode", e.target.value.toUpperCase())
            }
            placeholder={t("formCountryPlaceholder")}
            maxLength={2}
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">
            {t("formSubdivision")}
          </label>
          <input
            className={fieldCls}
            value={form.preferredSubdivisionCode}
            onChange={(e) =>
              update("preferredSubdivisionCode", e.target.value.toUpperCase())
            }
            placeholder={t("formSubdivisionPlaceholder")}
            maxLength={10}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-outline-variant/30 pt-6">
        <p className="text-xs text-on-surface-variant">{t("formHint")}</p>
        <button
          type="submit"
          disabled={status === "sending" || status === "ok"}
          className="rounded bg-primary px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-primary transition hover:bg-primary-dim disabled:opacity-60"
        >
          {status === "sending"
            ? t("submitSending")
            : status === "ok"
              ? t("submitSuccess")
              : t("submitButton")}
        </button>
      </div>

      {status === "error" && (
        <p className="text-sm text-error-container">
          {errorSuffix()}
          {error === "unauthenticated" ? (
            <>
              {" "}
              <a
                href={`/${locale}/login`}
                className="text-primary hover:underline"
              >
                {t("signInLink")}
              </a>
              .
            </>
          ) : null}
        </p>
      )}
    </form>
  );
}
