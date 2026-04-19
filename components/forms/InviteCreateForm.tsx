"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type InviteCreateFormProps = {
  canSetRole?: boolean;
  defaultCountryCode?: string;
  defaultSubdivisionCode?: string;
};

type FormState = {
  email: string;
  role: "reviewer" | "senior_reviewer" | "regional_admin" | "global_admin";
  countryCode: string;
  subdivisionCode: string;
  isGlobalScope: boolean;
};

const initialState: FormState = {
  email: "",
  role: "reviewer",
  countryCode: "",
  subdivisionCode: "",
  isGlobalScope: false,
};

export function InviteCreateForm({
  canSetRole = false,
  defaultCountryCode = "",
  defaultSubdivisionCode = "",
}: InviteCreateFormProps) {
  const t = useTranslations("invites");
  const [form, setForm] = useState<FormState>({
    ...initialState,
    countryCode: defaultCountryCode,
    subdivisionCode: defaultSubdivisionCode,
  });
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          role: canSetRole ? form.role : "reviewer",
          countryCode: form.countryCode || undefined,
          subdivisionCode: form.subdivisionCode || undefined,
          isGlobalScope: canSetRole ? form.isGlobalScope : false,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "invite_creation_failed");
      }

      setStatus("success");
      setMessage(
        t("successFormat", {
          token: data.token,
          region: data.regionLabel,
          expires: new Date(data.expiresAt).toLocaleString(),
        })
      );
      setForm({
        ...initialState,
        countryCode: defaultCountryCode,
        subdivisionCode: defaultSubdivisionCode,
      });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : t("errorGeneric"));
    }
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      className="space-y-4 rounded-lg bg-surface-container-low p-6"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-outline-variant" />
        <div>
          <h2 className="font-headline text-2xl text-primary">
            {t("createTitle")}
          </h2>
          <p className="text-sm text-on-surface-variant">{t("createSubtitle")}</p>
        </div>
      </div>

      <input
        className="w-full rounded-lg border-outline-variant bg-surface-container-lowest"
        placeholder={t("emailPlaceholder")}
        type="email"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        required
      />

      {canSetRole ? (
        <select
          className="w-full rounded-lg border-outline-variant bg-surface-container-lowest"
          value={form.role}
          onChange={(e) => update("role", e.target.value as FormState["role"])}
        >
          <option value="reviewer">{t("roleReviewer")}</option>
          <option value="senior_reviewer">{t("roleSenior")}</option>
          <option value="regional_admin">{t("roleRegional")}</option>
          <option value="global_admin">{t("roleGlobal")}</option>
        </select>
      ) : null}

      {canSetRole ? (
        <label className="flex items-center gap-3 rounded-lg bg-surface-container-lowest px-4 py-3 text-sm text-on-surface">
          <input
            type="checkbox"
            checked={form.isGlobalScope}
            onChange={(e) => update("isGlobalScope", e.target.checked)}
          />
          {t("globalScope")}
        </label>
      ) : null}

      {!form.isGlobalScope ? (
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="rounded-lg border-outline-variant bg-surface-container-lowest"
            placeholder={t("countryPlaceholder")}
            value={form.countryCode}
            onChange={(e) => update("countryCode", e.target.value.toUpperCase())}
            maxLength={2}
            required={!form.isGlobalScope}
          />
          <input
            className="rounded-lg border-outline-variant bg-surface-container-lowest"
            placeholder={t("subdivisionPlaceholder")}
            value={form.subdivisionCode}
            onChange={(e) =>
              update("subdivisionCode", e.target.value.toUpperCase())
            }
          />
        </div>
      ) : null}

      {message ? (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            status === "success"
              ? "bg-secondary-container text-on-surface"
              : "bg-error-container text-on-error-container"
          }`}
        >
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={status === "saving"}
        className="inline-flex w-full items-center justify-center rounded bg-primary px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-primary transition-colors hover:bg-primary-dim disabled:opacity-60"
      >
        {status === "saving" ? t("issuing") : t("issue")}
      </button>
    </form>
  );
}
