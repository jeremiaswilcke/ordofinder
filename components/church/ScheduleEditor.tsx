"use client";

import * as React from "react";
import type {
  ConfessionTimeRow,
  MassTimeRow,
} from "@/lib/schedules";

const WEEKDAYS_DE = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

const RITES = [
  "roman",
  "byzantine",
  "maronite",
  "chaldean",
  "syro_malabar",
  "syro_malankara",
  "coptic_catholic",
  "ethiopian_catholic",
  "armenian_catholic",
  "ambrosian",
  "mozarabic",
  "other",
] as const;

const FORMS = ["novus_ordo", "tridentine", "not_applicable"] as const;

type Props = {
  churchId: string;
  initialMasses: MassTimeRow[];
  initialConfessions: ConfessionTimeRow[];
  currentUserId: string;
  canDeleteAny: boolean;
};

export function ScheduleEditor({
  churchId,
  initialMasses,
  initialConfessions,
  currentUserId,
  canDeleteAny,
}: Props) {
  const [masses, setMasses] = React.useState(initialMasses);
  const [confessions, setConfessions] = React.useState(initialConfessions);

  async function addMass(form: MassFormState) {
    const res = await fetch("/api/mass-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ churchId, ...form }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `http_${res.status}`);
    }
    const { id } = (await res.json()) as { id: string };
    setMasses((prev) =>
      [
        ...prev,
        {
          id,
          weekday: form.weekday,
          startTime: form.startTime,
          languageCode: form.languageCode,
          rite: form.rite,
          form: form.form,
          notes: form.notes ?? null,
          createdBy: currentUserId,
        },
      ].sort((a, b) =>
        a.weekday === b.weekday
          ? a.startTime.localeCompare(b.startTime)
          : a.weekday - b.weekday
      )
    );
  }

  async function removeMass(id: string) {
    const res = await fetch(`/api/mass-times?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) return;
    setMasses((prev) => prev.filter((m) => m.id !== id));
  }

  async function addConfession(form: ConfessionFormState) {
    const res = await fetch("/api/confession-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ churchId, ...form }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `http_${res.status}`);
    }
    const { id } = (await res.json()) as { id: string };
    setConfessions((prev) =>
      [
        ...prev,
        {
          id,
          weekday: form.weekday,
          startTime: form.startTime,
          endTime: form.endTime ?? null,
          languageCode: form.languageCode ?? null,
          notes: form.notes ?? null,
          createdBy: currentUserId,
        },
      ].sort((a, b) =>
        a.weekday === b.weekday
          ? a.startTime.localeCompare(b.startTime)
          : a.weekday - b.weekday
      )
    );
  }

  async function removeConfession(id: string) {
    const res = await fetch(
      `/api/confession-times?id=${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
    if (!res.ok) return;
    setConfessions((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <header>
          <h2 className="font-headline text-2xl text-primary">Messzeiten</h2>
          <p className="text-sm text-on-surface-variant">
            Wochentag, Uhrzeit, Sprache, Ritus und Form. „Usus Antiquior" für
            die außerordentliche Form nutzen.
          </p>
        </header>

        <MassList
          items={masses}
          canDeleteAny={canDeleteAny}
          currentUserId={currentUserId}
          onRemove={removeMass}
        />

        <MassForm onSubmit={addMass} />
      </section>

      <section className="space-y-4">
        <header>
          <h2 className="font-headline text-2xl text-primary">Beichtzeiten</h2>
          <p className="text-sm text-on-surface-variant">
            Wochentag, Uhrzeit (und optional Ende), Sprache, Hinweis. Bei „nach
            Vereinbarung" einen Hinweis setzen.
          </p>
        </header>

        <ConfessionList
          items={confessions}
          canDeleteAny={canDeleteAny}
          currentUserId={currentUserId}
          onRemove={removeConfession}
        />

        <ConfessionForm onSubmit={addConfession} />
      </section>
    </div>
  );
}

// --- Listen --------------------------------------------------------------

function MassList({
  items,
  canDeleteAny,
  currentUserId,
  onRemove,
}: {
  items: MassTimeRow[];
  canDeleteAny: boolean;
  currentUserId: string;
  onRemove: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded border border-outline-variant/30 bg-surface-container-lowest p-4 text-sm text-on-surface-variant">
        Noch keine Messzeiten eingetragen.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-outline-variant/30 rounded border border-outline-variant/30 bg-surface-container-lowest">
      {items.map((m) => {
        const canDelete = canDeleteAny || m.createdBy === currentUserId;
        return (
          <li
            key={m.id}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 text-sm"
          >
            <span className="font-headline text-base text-primary">
              {WEEKDAYS_DE[m.weekday]} · {m.startTime}
            </span>
            <span className="text-on-surface-variant">
              {m.languageCode.toUpperCase()} · {formLabel(m.form)} · {riteLabel(m.rite)}
              {m.notes ? ` · ${m.notes}` : ""}
            </span>
            {canDelete ? (
              <button
                type="button"
                onClick={() => onRemove(m.id)}
                className="rounded border border-outline/60 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-on-surface-variant hover:border-error hover:text-error"
              >
                Entfernen
              </button>
            ) : (
              <span className="text-[10px] uppercase tracking-[0.14em] text-outline">
                fremd
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function ConfessionList({
  items,
  canDeleteAny,
  currentUserId,
  onRemove,
}: {
  items: ConfessionTimeRow[];
  canDeleteAny: boolean;
  currentUserId: string;
  onRemove: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded border border-outline-variant/30 bg-surface-container-lowest p-4 text-sm text-on-surface-variant">
        Noch keine Beichtzeiten eingetragen.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-outline-variant/30 rounded border border-outline-variant/30 bg-surface-container-lowest">
      {items.map((c) => {
        const canDelete = canDeleteAny || c.createdBy === currentUserId;
        return (
          <li
            key={c.id}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 text-sm"
          >
            <span className="font-headline text-base text-primary">
              {WEEKDAYS_DE[c.weekday]} · {c.startTime}
              {c.endTime ? `–${c.endTime}` : ""}
            </span>
            <span className="text-on-surface-variant">
              {c.languageCode ? c.languageCode.toUpperCase() + " · " : ""}
              {c.notes ?? ""}
            </span>
            {canDelete ? (
              <button
                type="button"
                onClick={() => onRemove(c.id)}
                className="rounded border border-outline/60 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-on-surface-variant hover:border-error hover:text-error"
              >
                Entfernen
              </button>
            ) : (
              <span className="text-[10px] uppercase tracking-[0.14em] text-outline">
                fremd
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// --- Forms ---------------------------------------------------------------

type MassFormState = {
  weekday: number;
  startTime: string;
  languageCode: string;
  rite: (typeof RITES)[number];
  form: (typeof FORMS)[number];
  notes?: string;
};

function MassForm({ onSubmit }: { onSubmit: (f: MassFormState) => Promise<void> }) {
  const [state, setState] = React.useState<MassFormState>({
    weekday: 0,
    startTime: "09:30",
    languageCode: "de",
    rite: "roman",
    form: "novus_ordo",
    notes: "",
  });
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr(null);
        try {
          await onSubmit(state);
          setState((s) => ({ ...s, notes: "" }));
        } catch (error) {
          setErr(error instanceof Error ? error.message : "unknown");
        } finally {
          setBusy(false);
        }
      }}
      className="grid gap-3 rounded border border-outline-variant/30 bg-surface-container-low p-4 md:grid-cols-6"
    >
      <Select
        label="Tag"
        value={state.weekday}
        onChange={(v) => setState((s) => ({ ...s, weekday: Number(v) }))}
        options={WEEKDAYS_DE.map((d, i) => ({ label: d, value: i }))}
      />
      <TimeInput
        label="Beginn"
        value={state.startTime}
        onChange={(v) => setState((s) => ({ ...s, startTime: v }))}
      />
      <TextInput
        label="Sprache"
        value={state.languageCode}
        onChange={(v) =>
          setState((s) => ({ ...s, languageCode: v.toLowerCase() }))
        }
        placeholder="de"
        maxLength={8}
      />
      <Select
        label="Ritus"
        value={state.rite}
        onChange={(v) => setState((s) => ({ ...s, rite: v as MassFormState["rite"] }))}
        options={RITES.map((r) => ({ label: riteLabel(r), value: r }))}
      />
      <Select
        label="Form"
        value={state.form}
        onChange={(v) => setState((s) => ({ ...s, form: v as MassFormState["form"] }))}
        options={FORMS.map((f) => ({ label: formLabel(f), value: f }))}
      />
      <TextInput
        label="Notiz"
        value={state.notes ?? ""}
        onChange={(v) => setState((s) => ({ ...s, notes: v }))}
        placeholder="optional"
        maxLength={200}
      />
      <div className="md:col-span-6 flex items-center justify-between">
        <p className="text-xs text-on-surface-variant">
          {err ? `Fehler: ${err}` : "Eintrag speichert direkt."}
        </p>
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-primary px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-primary hover:bg-primary-dim disabled:opacity-50"
        >
          {busy ? "Speichern…" : "Messzeit hinzufügen"}
        </button>
      </div>
    </form>
  );
}

type ConfessionFormState = {
  weekday: number;
  startTime: string;
  endTime?: string;
  languageCode?: string;
  notes?: string;
};

function ConfessionForm({
  onSubmit,
}: {
  onSubmit: (f: ConfessionFormState) => Promise<void>;
}) {
  const [state, setState] = React.useState<ConfessionFormState>({
    weekday: 5,
    startTime: "17:00",
    endTime: "17:45",
    languageCode: "de",
    notes: "",
  });
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr(null);
        try {
          await onSubmit({
            ...state,
            endTime: state.endTime || undefined,
            languageCode: state.languageCode || undefined,
            notes: state.notes || undefined,
          });
        } catch (error) {
          setErr(error instanceof Error ? error.message : "unknown");
        } finally {
          setBusy(false);
        }
      }}
      className="grid gap-3 rounded border border-outline-variant/30 bg-surface-container-low p-4 md:grid-cols-6"
    >
      <Select
        label="Tag"
        value={state.weekday}
        onChange={(v) => setState((s) => ({ ...s, weekday: Number(v) }))}
        options={WEEKDAYS_DE.map((d, i) => ({ label: d, value: i }))}
      />
      <TimeInput
        label="Beginn"
        value={state.startTime}
        onChange={(v) => setState((s) => ({ ...s, startTime: v }))}
      />
      <TimeInput
        label="Ende"
        value={state.endTime ?? ""}
        onChange={(v) => setState((s) => ({ ...s, endTime: v }))}
        optional
      />
      <TextInput
        label="Sprache"
        value={state.languageCode ?? ""}
        onChange={(v) => setState((s) => ({ ...s, languageCode: v.toLowerCase() }))}
        placeholder="de"
        maxLength={8}
      />
      <TextInput
        label="Hinweis"
        value={state.notes ?? ""}
        onChange={(v) => setState((s) => ({ ...s, notes: v }))}
        placeholder="z.B. nach Vereinbarung"
        maxLength={200}
        colSpan={2}
      />
      <div className="md:col-span-6 flex items-center justify-between">
        <p className="text-xs text-on-surface-variant">
          {err ? `Fehler: ${err}` : "Eintrag speichert direkt."}
        </p>
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-primary px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-primary hover:bg-primary-dim disabled:opacity-50"
        >
          {busy ? "Speichern…" : "Beichtzeit hinzufügen"}
        </button>
      </div>
    </form>
  );
}

// --- Primitives ---------------------------------------------------------

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  options: Array<{ label: string; value: string | number }>;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.18em] text-outline">
        {label}
      </span>
      <select
        className="rounded border border-outline-variant/40 bg-surface-container-lowest px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  colSpan,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  colSpan?: number;
}) {
  return (
    <label
      className={`flex flex-col gap-1 ${colSpan ? `md:col-span-${colSpan}` : ""}`}
    >
      <span className="text-[10px] uppercase tracking-[0.18em] text-outline">
        {label}
      </span>
      <input
        className="rounded border border-outline-variant/40 bg-surface-container-lowest px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </label>
  );
}

function TimeInput({
  label,
  value,
  onChange,
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  optional?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.18em] text-outline">
        {label}
        {optional ? " (optional)" : ""}
      </span>
      <input
        type="time"
        className="rounded border border-outline-variant/40 bg-surface-container-lowest px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

// --- Labels -------------------------------------------------------------

function riteLabel(rite: string): string {
  switch (rite) {
    case "roman":
      return "Römisch";
    case "byzantine":
      return "Byzantinisch";
    case "maronite":
      return "Maronitisch";
    case "chaldean":
      return "Chaldäisch";
    case "syro_malabar":
      return "Syro-Malabar";
    case "syro_malankara":
      return "Syro-Malankara";
    case "coptic_catholic":
      return "Koptisch-kath.";
    case "ethiopian_catholic":
      return "Äthiopisch-kath.";
    case "armenian_catholic":
      return "Armenisch-kath.";
    case "ambrosian":
      return "Ambrosianisch";
    case "mozarabic":
      return "Mozarabisch";
    default:
      return "sonstiger";
  }
}

function formLabel(form: string): string {
  switch (form) {
    case "novus_ordo":
      return "Novus Ordo";
    case "tridentine":
      return "Usus Antiquior";
    default:
      return "nicht anwendbar";
  }
}
