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

const faithChips = [
  "Daily Adoration",
  "Gregorian Chant",
  "Youth Guild",
  "Frequent Confession",
  "Strong Catechesis",
  "Quiet Prayer",
];

function fieldClassName() {
  return "w-full border-0 border-b-2 border-outline-variant/30 bg-transparent px-0 py-3 font-body text-base text-on-surface placeholder:text-outline-variant/60 focus:border-primary focus:ring-0";
}

export function SubmissionForm() {
  const [form, setForm] = useState(initialState);
  const [selectedFaithChips, setSelectedFaithChips] = useState<string[]>(["Daily Adoration", "Gregorian Chant"]);
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

  function toggleFaithChip(value: string) {
    setSelectedFaithChips((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
      <form className="space-y-12" onSubmit={handleSubmit}>
        <section>
          <SectionTitle title="Identity & Location" subtitle="Canonical name, city entry-point and precise coordinates." />
          <div className="space-y-6">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">Church Name</label>
              <input className={fieldClassName()} placeholder="e.g. Basilica of the Holy Trinity" value={form.churchName} onChange={(event) => update("churchName", event.target.value)} required />
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">Diocese / Jurisdiction</label>
                <input className={fieldClassName()} placeholder="Archdiocese / Diocese" value={form.diocese} onChange={(event) => update("diocese", event.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">Year of Consecration</label>
                <input className={fieldClassName()} placeholder="YYYY" type="number" min={100} max={new Date().getFullYear()} value={form.consecrationYear} onChange={(event) => update("consecrationYear", event.target.value)} />
              </div>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">City</label>
                <input className={fieldClassName()} placeholder="Vienna" value={form.city} onChange={(event) => update("city", event.target.value)} required />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">Country Code</label>
                <input className={fieldClassName()} placeholder="AT" value={form.countryCode} onChange={(event) => update("countryCode", event.target.value.toUpperCase())} required maxLength={2} />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">Timezone</label>
                <input className={fieldClassName()} placeholder="Europe/Vienna" value={form.timezone} onChange={(event) => update("timezone", event.target.value)} required />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-outline-variant/10 bg-surface-container-low p-8">
          <SectionTitle title="Lebendigkeit des Glaubens" subtitle="Observed rhythm, catechesis, youth presence and communal strength." />
          <p className="-mt-2 text-sm leading-relaxed text-on-surface-variant">
            Describe the spiritual energy and parish vitality: liturgical seriousness, youth presence, devotions, confession, adoration and communal life.
          </p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {faithChips.map((chip) => {
              const active = selectedFaithChips.includes(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => toggleFaithChip(chip)}
                  className={`flex items-center justify-between rounded border px-4 py-3 text-left transition-colors ${
                    active
                      ? "border-primary/30 bg-primary/5"
                      : "border-outline-variant/20 bg-surface-container-lowest hover:bg-primary/5"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-[0.08em] text-primary">{chip}</span>
                  <Icon name="check_circle" className={active ? "text-primary" : "text-outline-variant"} />
                </button>
              );
            })}
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">Liturgy Quality</label>
              <input className={fieldClassName()} placeholder="1-10" type="number" min={1} max={10} value={form.liturgyQuality} onChange={(event) => update("liturgyQuality", event.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">Music</label>
              <input className={fieldClassName()} placeholder="1-10" type="number" min={1} max={10} value={form.music} onChange={(event) => update("music", event.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">Homily Clarity</label>
              <input className={fieldClassName()} placeholder="1-10" type="number" min={1} max={10} value={form.homilyClarity} onChange={(event) => update("homilyClarity", event.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">Vibrancy</label>
              <input className={fieldClassName()} placeholder="1-10" type="number" min={1} max={10} value={form.vibrancy} onChange={(event) => update("vibrancy", event.target.value)} required />
            </div>
          </div>
          <div className="mt-6">
            <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-outline">Parish Life Narrative</label>
            <textarea
              className="min-h-32 w-full resize-none rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-4 leading-relaxed placeholder:text-outline-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Detail the community activities, prayer life, youth engagement and traditional devotions..."
              value={form.shortNote}
              maxLength={200}
              onChange={(event) => update("shortNote", event.target.value)}
            />
          </div>
        </section>

        <section>
          <SectionTitle title="Architectural Metadata" subtitle="Diocese, capacity, style and a short archival note." />
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">Structural Style</label>
              <input className={fieldClassName()} placeholder="Romanesque Revival / Gothic / Baroque..." value={form.architecturalStyle} onChange={(event) => update("architecturalStyle", event.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">Capacity (approx.)</label>
              <input className={fieldClassName()} placeholder="Seats" type="number" min={10} max={50000} value={form.capacity} onChange={(event) => update("capacity", event.target.value)} />
            </div>
          </div>
          <div className="mt-6">
            <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">Editorial Description</label>
            <textarea className="min-h-40 w-full resize-none rounded-lg border border-outline-variant/20 bg-surface-container-low p-4 leading-relaxed placeholder:text-outline-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Provide historical context, architectural character, schedule confidence and the spiritual atmosphere of the church..." maxLength={2000} value={form.description} onChange={(event) => update("description", event.target.value)} />
          </div>
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

        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-on-surface pt-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-outline">Review window: typically 7-14 days</p>
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-outline transition-colors hover:text-primary">
              Discard Draft
            </button>
            <button
              type="submit"
              disabled={status === "saving"}
              className="inline-flex items-center justify-center rounded bg-primary px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-primary transition-colors hover:bg-primary-dim disabled:opacity-60"
            >
              {status === "saving" ? "Submitting..." : "Submit to Archive"}
            </button>
          </div>
        </div>
      </form>
      <aside className="h-fit space-y-8 lg:sticky lg:top-24">
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-high/30 p-8 shadow-archival">
          <h3 className="border-b border-outline-variant/20 pb-4 font-headline text-lg text-primary">Submission Guidelines</h3>
          <div className="mt-5 space-y-5">
            <div className="flex gap-3">
              <Icon name="verified_user" className="text-primary" />
              <p className="text-sm text-on-surface-variant">Entries are reviewed for historical accuracy, liturgical plausibility and location fidelity.</p>
            </div>
            <div className="flex gap-3">
              <Icon name="photo_library" className="text-primary" />
              <p className="text-sm text-on-surface-variant">Include high-resolution facade or interior references once the image workflow is enabled.</p>
            </div>
            <div className="flex gap-3">
              <Icon name="local_library" className="text-primary" />
              <p className="text-sm text-on-surface-variant">Cite sources for consecration dates and write editorially, not polemically.</p>
            </div>
          </div>
        </div>
        <div className="group relative aspect-[4/5] overflow-hidden rounded-xl shadow-archival">
          <img
            alt="Sacred church interior"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="font-headline text-2xl leading-snug text-on-primary">Preserving the dignity of sacred spaces.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
