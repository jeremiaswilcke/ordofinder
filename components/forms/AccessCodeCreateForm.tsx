"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "../ui/Icon";

type CodeRecord = {
  id: string;
  label: string | null;
  role: string;
  country_code: string | null;
  subdivision_code: string | null;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  created_at: string;
};

export function AccessCodeCreateForm() {
  const t = useTranslations("accessCode");
  const [label, setLabel] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [subdivisionCode, setSubdivisionCode] = useState("");
  const [maxUses, setMaxUses] = useState("1");
  const [expiresAt, setExpiresAt] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [lastPlain, setLastPlain] = useState<string | null>(null);
  const [codes, setCodes] = useState<CodeRecord[]>([]);

  useEffect(() => {
    void refreshCodes();
  }, []);

  async function refreshCodes() {
    try {
      const res = await fetch("/api/access-codes");
      if (!res.ok) return;
      const data = await res.json();
      setCodes(data.codes ?? []);
    } catch {
      /* ignore */
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setErrorMessage("");

    try {
      const response = await fetch("/api/access-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label || undefined,
          countryCode: countryCode || undefined,
          subdivisionCode: subdivisionCode || undefined,
          maxUses: maxUses === "" ? null : Number(maxUses),
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error ?? "code_create_failed");
      setLastPlain(data.plain);
      setLabel("");
      setCountryCode("");
      setSubdivisionCode("");
      setMaxUses("1");
      setExpiresAt("");
      setStatus("idle");
      void refreshCodes();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "code_create_failed");
    }
  }

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label>{t("createLabelField")}</Label>
          <input
            className={fieldClass()}
            placeholder={t("createLabelPlaceholder")}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={160}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>{t("createCountry")}</Label>
            <input
              className={fieldClass()}
              placeholder="AT"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
              maxLength={2}
            />
          </div>
          <div>
            <Label>{t("createSubdivision")}</Label>
            <input
              className={fieldClass()}
              placeholder="AT-9"
              value={subdivisionCode}
              onChange={(e) => setSubdivisionCode(e.target.value.toUpperCase())}
              maxLength={10}
            />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>{t("createMaxUses")}</Label>
            <input
              className={fieldClass()}
              type="number"
              min={1}
              max={10000}
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder={t("createMaxUsesPlaceholder")}
            />
            <p className="mt-1 text-[11px] text-on-surface-variant">{t("createMaxUsesHint")}</p>
          </div>
          <div>
            <Label>{t("createExpires")}</Label>
            <input
              className={fieldClass()}
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
        </div>

        {status === "error" && errorMessage ? (
          <div className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={status === "saving"}
          className="inline-flex items-center justify-center gap-2 rounded bg-primary px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-primary transition hover:bg-primary-dim disabled:opacity-60"
        >
          <Icon name="key" />
          {status === "saving" ? t("createSubmitting") : t("createSubmit")}
        </button>
      </form>

      {lastPlain ? (
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary">{t("createResultTitle")}</p>
          <p className="mt-2 text-sm text-on-surface-variant">{t("createResultHint")}</p>
          <p className="mt-3 break-all font-mono text-2xl font-semibold tracking-[0.2em] text-primary">
            {lastPlain}
          </p>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(lastPlain)}
            className="mt-3 inline-flex items-center gap-2 rounded border border-primary/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary hover:bg-primary/10"
          >
            <Icon name="content_copy" />
            {t("createCopy")}
          </button>
        </div>
      ) : null}

      {codes.length > 0 ? (
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">{t("listTitle")}</p>
          <div className="mt-3 space-y-2">
            {codes.map((code) => (
              <div
                key={code.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-on-surface">
                    {code.label ?? t("listNoLabel")}
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    {code.subdivision_code ?? code.country_code ?? t("listScopeAny")} ·{" "}
                    {t("listUsesFormat", {
                      used: code.uses_count,
                      max: code.max_uses ?? "∞",
                    })}
                    {code.expires_at
                      ? ` · ${t("listExpires", { date: new Date(code.expires_at).toLocaleDateString() })}`
                      : ""}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-[0.15em] text-outline">
                  {code.role.replaceAll("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">
      {children}
    </label>
  );
}

function fieldClass() {
  return "w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-outline-variant/60 focus:border-primary focus:outline-none";
}
