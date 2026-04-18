"use client";

import { useState } from "react";

export function InviteRedeemForm({ token }: { token: string }) {
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    try {
      const response = await fetch("/api/invites/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, displayName, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "invite_redeem_failed");
      }

      setStatus("success");
      setMessage("Account created. You can now sign in from the archive login page.");
      setDisplayName("");
      setPassword("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Invite redemption failed.");
    }
  }

  return (
    <form className="mt-8 space-y-4 rounded-lg bg-surface-container-low p-6" onSubmit={handleSubmit}>
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-outline-variant" />
        <div>
          <h2 className="font-headline text-2xl text-primary">Redeem Invite</h2>
          <p className="text-sm text-on-surface-variant">Set your display name and password to activate reviewer access.</p>
        </div>
      </div>

      <input
        className="w-full rounded-lg border-outline-variant bg-surface-container-lowest"
        placeholder="Display name"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        required
      />
      <input
        className="w-full rounded-lg border-outline-variant bg-surface-container-lowest"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        minLength={8}
        required
      />

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
        {status === "saving" ? "Activating..." : "Activate Access"}
      </button>
    </form>
  );
}
