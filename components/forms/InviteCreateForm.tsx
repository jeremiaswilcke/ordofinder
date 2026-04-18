"use client";

import { useState } from "react";

type InviteCreateFormProps = {
  canSetRole?: boolean;
  defaultCountryCode?: string;
  defaultSubdivisionCode?: string;
};

type FormState = {
  email: string;
  role: "reviewer" | "regional_admin" | "global_admin";
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
  const [form, setForm] = useState<FormState>({
    ...initialState,
    countryCode: defaultCountryCode,
    subdivisionCode: defaultSubdivisionCode,
  });
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
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
      setMessage(`Token: ${data.token} · Region: ${data.regionLabel} · Expires: ${new Date(data.expiresAt).toLocaleString("en-GB")}`);
      setForm({
        ...initialState,
        countryCode: defaultCountryCode,
        subdivisionCode: defaultSubdivisionCode,
      });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Invite creation failed.");
    }
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="space-y-4 rounded-lg bg-surface-container-low p-6" onSubmit={handleSubmit}>
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-outline-variant" />
        <div>
          <h2 className="font-headline text-2xl text-primary">Create Invite</h2>
          <p className="text-sm text-on-surface-variant">Issue a scoped archive invitation for a reviewer or steward.</p>
        </div>
      </div>

      <input
        className="w-full rounded-lg border-outline-variant bg-surface-container-lowest"
        placeholder="Invitee email"
        type="email"
        value={form.email}
        onChange={(event) => update("email", event.target.value)}
        required
      />

      {canSetRole ? (
        <select
          className="w-full rounded-lg border-outline-variant bg-surface-container-lowest"
          value={form.role}
          onChange={(event) => update("role", event.target.value as FormState["role"])}
        >
          <option value="reviewer">Reviewer</option>
          <option value="regional_admin">Regional admin</option>
          <option value="global_admin">Global admin</option>
        </select>
      ) : null}

      {canSetRole ? (
        <label className="flex items-center gap-3 rounded-lg bg-surface-container-lowest px-4 py-3 text-sm text-on-surface">
          <input
            type="checkbox"
            checked={form.isGlobalScope}
            onChange={(event) => update("isGlobalScope", event.target.checked)}
          />
          Global scope
        </label>
      ) : null}

      {!form.isGlobalScope ? (
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="rounded-lg border-outline-variant bg-surface-container-lowest"
            placeholder="Country code"
            value={form.countryCode}
            onChange={(event) => update("countryCode", event.target.value.toUpperCase())}
            maxLength={2}
            required={!form.isGlobalScope}
          />
          <input
            className="rounded-lg border-outline-variant bg-surface-container-lowest"
            placeholder="Subdivision code"
            value={form.subdivisionCode}
            onChange={(event) => update("subdivisionCode", event.target.value.toUpperCase())}
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
        {status === "saving" ? "Issuing..." : "Issue Invite"}
      </button>
    </form>
  );
}
