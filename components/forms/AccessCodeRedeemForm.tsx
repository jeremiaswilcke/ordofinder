"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function AccessCodeRedeemForm({
  locale,
  prefillCode = "",
  initialError = "",
}: {
  locale: string;
  prefillCode?: string;
  initialError?: string;
}) {
  const t = useTranslations("accessCode");
  const router = useRouter();
  const [code, setCode] = useState(prefillCode);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    initialError ? "error" : "idle",
  );
  const [message, setMessage] = useState(initialError);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    try {
      const response = await fetch("/api/access-codes/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error ?? "redeem_failed");
      }
      setStatus("success");
      setMessage(t("redeemSuccess"));
      setTimeout(() => router.push(`/${locale}/reviewer`), 800);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "redeem_failed");
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">
          {t("redeemCodeLabel")}
        </label>
        <input
          className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 font-mono tracking-[0.15em] uppercase"
          placeholder={t("redeemCodePlaceholder")}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          autoComplete="off"
          maxLength={20}
        />
      </div>

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
        {status === "saving" ? t("redeemSubmitting") : t("redeemSubmit")}
      </button>
    </form>
  );
}
