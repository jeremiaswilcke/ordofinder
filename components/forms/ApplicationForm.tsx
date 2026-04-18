"use client";

import * as React from "react";

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

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">
          Anzeigename
        </label>
        <input
          className={fieldCls}
          value={form.displayName}
          onChange={(e) => update("displayName", e.target.value)}
          placeholder="So erscheinst du im Archiv"
          required
          minLength={2}
          maxLength={120}
        />
      </div>

      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">
          Wer bist du?
        </label>
        <textarea
          className={`${fieldCls} min-h-32 resize-y`}
          value={form.about}
          onChange={(e) => update("about", e.target.value)}
          placeholder="Kurzer Abriss: Alter, Beruf, Beziehung zum Glauben und zur Liturgie, vorhandene Bezugsgemeinde…"
          required
          minLength={10}
          maxLength={2000}
        />
      </div>

      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">
          Warum möchtest du reviewen?
        </label>
        <textarea
          className={`${fieldCls} min-h-32 resize-y`}
          value={form.motivation}
          onChange={(e) => update("motivation", e.target.value)}
          placeholder="Was treibt dich an, wo und wie möchtest du beitragen, welche liturgischen Erfahrungen hast du…"
          required
          minLength={10}
          maxLength={2000}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">
            Bevorzugtes Land (ISO-2)
          </label>
          <input
            className={fieldCls}
            value={form.preferredCountryCode}
            onChange={(e) =>
              update("preferredCountryCode", e.target.value.toUpperCase())
            }
            placeholder="AT"
            maxLength={2}
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">
            Subdivision (optional)
          </label>
          <input
            className={fieldCls}
            value={form.preferredSubdivisionCode}
            onChange={(e) =>
              update("preferredSubdivisionCode", e.target.value.toUpperCase())
            }
            placeholder="AT-9"
            maxLength={10}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-outline-variant/30 pt-6">
        <p className="text-xs text-on-surface-variant">
          Bearbeitung durch Tier 0 oder Global Admin — typisch innerhalb einer
          Woche.
        </p>
        <button
          type="submit"
          disabled={status === "sending" || status === "ok"}
          className="rounded bg-primary px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-primary transition hover:bg-primary-dim disabled:opacity-60"
        >
          {status === "sending"
            ? "Senden…"
            : status === "ok"
              ? "Danke — Weiterleitung…"
              : "Bewerbung einreichen"}
        </button>
      </div>

      {status === "error" && (
        <p className="text-sm text-error-container">
          Das hat nicht geklappt
          {error === "application_already_pending"
            ? ": es gibt schon eine offene Bewerbung von dir."
            : error === "already_has_role"
              ? ": du hast bereits eine Rolle."
              : error === "unauthenticated"
                ? ": du bist nicht eingeloggt."
                : "."}{" "}
          <a
            href={`/${locale}/login`}
            className="text-primary hover:underline"
          >
            Anmelden
          </a>
          .
        </p>
      )}
    </form>
  );
}
