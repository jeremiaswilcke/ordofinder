"use client";

import { useState } from "react";
import { Icon } from "../ui/Icon";

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="h-px w-8 bg-outline-variant" />
      <div>
        <h3 className="font-headline text-2xl text-primary">{title}</h3>
        <p className="text-sm text-on-surface-variant">{subtitle}</p>
      </div>
    </div>
  );
}

const initialState = {
  churchName: "",
  city: "",
  countryCode: "",
  timezone: "",
  diocese: "",
  consecrationYear: "",
  architecturalStyle: "",
  capacity: "",
  liturgyQuality: "8",
  music: "8",
  homilyClarity: "8",
  vibrancy: "8",
  shortNote: "",
  description: "",
};

export function SubmissionForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    const payload = {
      ...form,
      consecrationYear: form.consecrationYear ? Number(form.consecrationYear) : undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      liturgyQuality: Number(form.liturgyQuality),
      music: Number(form.music),
      homilyClarity: Number(form.homilyClarity),
      vibrancy: Number(form.vibrancy),
    };

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "submission_failed");
      }

      setStatus("success");
      setMessage(data.mode === "local-fallback"
        ? "Validated locally. Connect Supabase to persist the submission."
        : "Submission sent to the review queue.");
      setForm(initialState);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Submission failed.");
    }
  }

  function update<K extends keyof typeof initialState>(key: K, value: (typeof initialState)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form className="space-y-8 rounded-lg bg-surface-container-low p-8" onSubmit={handleSubmit}>
        <section>
          <SectionTitle title="Identity & Location" subtitle="Canonical name, city entry-point and precise coordinates." />
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Church name" value={form.churchName} onChange={(event) => update("churchName", event.target.value)} required />
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="City" value={form.city} onChange={(event) => update("city", event.target.value)} required />
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Country code" value={form.countryCode} onChange={(event) => update("countryCode", event.target.value.toUpperCase())} required maxLength={2} />
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Timezone" value={form.timezone} onChange={(event) => update("timezone", event.target.value)} required />
          </div>
        </section>
        <section>
          <SectionTitle title="Lebendigkeit des Glaubens" subtitle="Observed rhythm, catechesis, youth presence and communal strength." />
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Liturgy quality (1-10)" type="number" min={1} max={10} value={form.liturgyQuality} onChange={(event) => update("liturgyQuality", event.target.value)} required />
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Music (1-10)" type="number" min={1} max={10} value={form.music} onChange={(event) => update("music", event.target.value)} required />
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Homily clarity (1-10)" type="number" min={1} max={10} value={form.homilyClarity} onChange={(event) => update("homilyClarity", event.target.value)} required />
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Vibrancy (1-10)" type="number" min={1} max={10} value={form.vibrancy} onChange={(event) => update("vibrancy", event.target.value)} required />
          </div>
        </section>
        <section>
          <SectionTitle title="Architectural Metadata" subtitle="Diocese, capacity, style and a short archival note." />
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Diocese" value={form.diocese} onChange={(event) => update("diocese", event.target.value)} />
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Consecration year" type="number" min={100} max={new Date().getFullYear()} value={form.consecrationYear} onChange={(event) => update("consecrationYear", event.target.value)} />
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Architectural style" value={form.architecturalStyle} onChange={(event) => update("architecturalStyle", event.target.value)} />
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Capacity" type="number" min={10} max={50000} value={form.capacity} onChange={(event) => update("capacity", event.target.value)} />
          </div>
          <input className="mt-4 w-full rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Short note" maxLength={200} value={form.shortNote} onChange={(event) => update("shortNote", event.target.value)} />
          <textarea className="mt-4 min-h-32 w-full rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Editorial description" maxLength={2000} value={form.description} onChange={(event) => update("description", event.target.value)} />
        </section>
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
          {status === "saving" ? "Submitting..." : "Submit for Review"}
        </button>
      </form>
      <aside className="h-fit rounded-lg bg-surface-container-lowest p-6 shadow-archival lg:sticky lg:top-24">
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Submission Guidelines</p>
        <div className="mt-5 space-y-5">
          <div className="flex gap-3">
            <Icon name="verified_user" className="text-primary" />
            <p className="text-sm text-on-surface-variant">Prefer verifiable schedules, diocesan naming and canonical parish titles.</p>
          </div>
          <div className="flex gap-3">
            <Icon name="photo_library" className="text-primary" />
            <p className="text-sm text-on-surface-variant">Hero images should come from trusted archives or moderated uploads.</p>
          </div>
          <div className="flex gap-3">
            <Icon name="local_library" className="text-primary" />
            <p className="text-sm text-on-surface-variant">Write editorially, not polemically; describe what is reliably observed.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
