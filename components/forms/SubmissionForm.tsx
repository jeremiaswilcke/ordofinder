"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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

type MassTimeRow = {
  weekday: string;
  startTime: string;
  languageCode: string;
  rite: string;
  form: string;
  notes: string;
};

const emptyMassTime: MassTimeRow = {
  weekday: "0",
  startTime: "10:00",
  languageCode: "de",
  rite: "roman",
  form: "novus_ordo",
  notes: "",
};

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;
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

const FAITH_CHIP_KEYS = [
  "faithChipDailyAdoration",
  "faithChipGregorianChant",
  "faithChipYouthGuild",
  "faithChipFrequentConfession",
  "faithChipStrongCatechesis",
  "faithChipQuietPrayer",
] as const;

function fieldClassName() {
  return "w-full border-0 border-b-2 border-outline-variant/30 bg-transparent px-0 py-3 font-body text-base text-on-surface placeholder:text-outline-variant/60 focus:border-primary focus:ring-0";
}

export function SubmissionForm() {
  const t = useTranslations("submission");
  const [form, setForm] = useState(initialState);
  const [massTimes, setMassTimes] = useState<MassTimeRow[]>([{ ...emptyMassTime }]);
  const [selectedFaithChips, setSelectedFaithChips] = useState<string[]>([
    "faithChipDailyAdoration",
    "faithChipGregorianChant",
  ]);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    const payload = {
      ...form,
      consecrationYear: form.consecrationYear
        ? Number(form.consecrationYear)
        : undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      liturgyQuality: Number(form.liturgyQuality),
      music: Number(form.music),
      homilyClarity: Number(form.homilyClarity),
      vibrancy: Number(form.vibrancy),
      massTimes: massTimes
        .filter((row) => row.startTime && row.languageCode)
        .map((row) => ({
          weekday: Number(row.weekday),
          startTime: row.startTime,
          languageCode: row.languageCode,
          rite: row.rite,
          form: row.form,
          notes: row.notes,
        })),
    };

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail =
          typeof data?.details === "string"
            ? data.details
            : data?.details
            ? JSON.stringify(data.details)
            : "";
        throw new Error(
          `${data?.error ?? "submission_failed"} (HTTP ${response.status})${
            detail ? ` — ${detail}` : ""
          }`
        );
      }

      setStatus("success");
      setMessage(
        data.mode === "local-fallback" ? t("successLocal") : t("successRemote")
      );
      setForm(initialState);
      setMassTimes([{ ...emptyMassTime }]);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : t("errorGeneric"));
    }
  }

  function addMassTime() {
    setMassTimes((current) => [...current, { ...emptyMassTime }]);
  }

  function removeMassTime(index: number) {
    setMassTimes((current) =>
      current.length <= 1 ? current : current.filter((_, i) => i !== index)
    );
  }

  function updateMassTime<K extends keyof MassTimeRow>(
    index: number,
    key: K,
    value: MassTimeRow[K]
  ) {
    setMassTimes((current) =>
      current.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    );
  }

  function update<K extends keyof typeof initialState>(
    key: K,
    value: (typeof initialState)[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleFaithChip(key: string) {
    setSelectedFaithChips((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
      <form className="space-y-12" onSubmit={handleSubmit}>
        <section>
          <SectionTitle
            title={t("sectionIdentityTitle")}
            subtitle={t("sectionIdentitySubtitle")}
          />
          <div className="space-y-6">
            <div>
              <Label>{t("churchName")}</Label>
              <input
                className={fieldClassName()}
                placeholder={t("churchNamePlaceholder")}
                value={form.churchName}
                onChange={(e) => update("churchName", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <Label>{t("diocese")}</Label>
                <input
                  className={fieldClassName()}
                  placeholder={t("diocesePlaceholder")}
                  value={form.diocese}
                  onChange={(e) => update("diocese", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("consecrationYear")}</Label>
                <input
                  className={fieldClassName()}
                  placeholder={t("consecrationYearPlaceholder")}
                  type="number"
                  min={100}
                  max={new Date().getFullYear()}
                  value={form.consecrationYear}
                  onChange={(e) => update("consecrationYear", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <Label>{t("city")}</Label>
                <input
                  className={fieldClassName()}
                  placeholder={t("cityPlaceholder")}
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>{t("countryCode")}</Label>
                <input
                  className={fieldClassName()}
                  placeholder={t("countryCodePlaceholder")}
                  value={form.countryCode}
                  onChange={(e) =>
                    update("countryCode", e.target.value.toUpperCase())
                  }
                  required
                  maxLength={2}
                />
              </div>
              <div>
                <Label>{t("timezone")}</Label>
                <input
                  className={fieldClassName()}
                  placeholder={t("timezonePlaceholder")}
                  value={form.timezone}
                  onChange={(e) => update("timezone", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-outline-variant/10 bg-surface-container-low p-8">
          <SectionTitle
            title={t("sectionFaithTitle")}
            subtitle={t("sectionFaithSubtitle")}
          />
          <p className="-mt-2 text-sm leading-relaxed text-on-surface-variant">
            {t("sectionFaithDescription")}
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {FAITH_CHIP_KEYS.map((key) => {
              const active = selectedFaithChips.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleFaithChip(key)}
                  className={`flex items-center justify-between rounded border px-4 py-3 text-left transition-colors ${
                    active
                      ? "border-primary/30 bg-primary/5"
                      : "border-outline-variant/20 bg-surface-container-lowest hover:bg-primary/5"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-[0.08em] text-primary">
                    {t(key)}
                  </span>
                  <Icon
                    name="check_circle"
                    className={active ? "text-primary" : "text-outline-variant"}
                  />
                </button>
              );
            })}
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <Label>{t("liturgyQuality")}</Label>
              <input
                className={fieldClassName()}
                placeholder={t("ratingPlaceholder")}
                type="number"
                min={1}
                max={10}
                value={form.liturgyQuality}
                onChange={(e) => update("liturgyQuality", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>{t("music")}</Label>
              <input
                className={fieldClassName()}
                placeholder={t("ratingPlaceholder")}
                type="number"
                min={1}
                max={10}
                value={form.music}
                onChange={(e) => update("music", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>{t("homilyClarity")}</Label>
              <input
                className={fieldClassName()}
                placeholder={t("ratingPlaceholder")}
                type="number"
                min={1}
                max={10}
                value={form.homilyClarity}
                onChange={(e) => update("homilyClarity", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>{t("vibrancy")}</Label>
              <input
                className={fieldClassName()}
                placeholder={t("ratingPlaceholder")}
                type="number"
                min={1}
                max={10}
                value={form.vibrancy}
                onChange={(e) => update("vibrancy", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mt-6">
            <Label>{t("shortNote")}</Label>
            <textarea
              className="min-h-32 w-full resize-none rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-4 leading-relaxed placeholder:text-outline-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={t("shortNotePlaceholder")}
              value={form.shortNote}
              maxLength={200}
              onChange={(e) => update("shortNote", e.target.value)}
            />
          </div>
        </section>

        <section>
          <SectionTitle
            title={t("sectionArchitectureTitle")}
            subtitle={t("sectionArchitectureSubtitle")}
          />
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <Label>{t("architecturalStyle")}</Label>
              <input
                className={fieldClassName()}
                placeholder={t("architecturalStylePlaceholder")}
                value={form.architecturalStyle}
                onChange={(e) => update("architecturalStyle", e.target.value)}
              />
            </div>
            <div>
              <Label>{t("capacity")}</Label>
              <input
                className={fieldClassName()}
                placeholder={t("capacityPlaceholder")}
                type="number"
                min={10}
                max={50000}
                value={form.capacity}
                onChange={(e) => update("capacity", e.target.value)}
              />
            </div>
          </div>
          <div className="mt-6">
            <Label>{t("description")}</Label>
            <textarea
              className="min-h-40 w-full resize-none rounded-lg border border-outline-variant/20 bg-surface-container-low p-4 leading-relaxed placeholder:text-outline-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={t("descriptionPlaceholder")}
              maxLength={2000}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
        </section>

        <section>
          <SectionTitle
            title={t("sectionScheduleTitle")}
            subtitle={t("sectionScheduleSubtitle")}
          />
          <p className="-mt-2 mb-6 text-sm leading-relaxed text-on-surface-variant">
            {t("sectionScheduleDescription")}
          </p>
          <div className="space-y-4">
            {massTimes.map((row, index) => (
              <div
                key={index}
                className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-4"
              >
                <div className="grid gap-4 md:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
                  <div>
                    <Label>{t("massWeekday")}</Label>
                    <select
                      className={fieldClassName()}
                      value={row.weekday}
                      onChange={(e) => updateMassTime(index, "weekday", e.target.value)}
                    >
                      {WEEKDAYS.map((day) => (
                        <option key={day} value={day}>
                          {t(`weekday${day}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>{t("massStartTime")}</Label>
                    <input
                      className={fieldClassName()}
                      type="time"
                      value={row.startTime}
                      onChange={(e) => updateMassTime(index, "startTime", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>{t("massLanguage")}</Label>
                    <input
                      className={fieldClassName()}
                      placeholder="de"
                      maxLength={8}
                      value={row.languageCode}
                      onChange={(e) =>
                        updateMassTime(index, "languageCode", e.target.value.toLowerCase())
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>{t("massRite")}</Label>
                    <select
                      className={fieldClassName()}
                      value={row.rite}
                      onChange={(e) => updateMassTime(index, "rite", e.target.value)}
                    >
                      {RITES.map((rite) => (
                        <option key={rite} value={rite}>
                          {t(`rite_${rite}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>{t("massForm")}</Label>
                    <select
                      className={fieldClassName()}
                      value={row.form}
                      onChange={(e) => updateMassTime(index, "form", e.target.value)}
                    >
                      {FORMS.map((f) => (
                        <option key={f} value={f}>
                          {t(`form_${f}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeMassTime(index)}
                      disabled={massTimes.length <= 1}
                      className="inline-flex items-center justify-center rounded border border-outline-variant/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container disabled:opacity-40"
                      aria-label={t("massRemove")}
                    >
                      <Icon name="delete" />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <Label>{t("massNotes")}</Label>
                  <input
                    className={fieldClassName()}
                    placeholder={t("massNotesPlaceholder")}
                    maxLength={200}
                    value={row.notes}
                    onChange={(e) => updateMassTime(index, "notes", e.target.value)}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addMassTime}
              className="inline-flex items-center gap-2 rounded border border-primary/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary/5"
            >
              <Icon name="add" />
              {t("massAdd")}
            </button>
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
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-outline">
            {t("reviewWindow")}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-outline transition-colors hover:text-primary"
              onClick={() => setForm(initialState)}
            >
              {t("discardDraft")}
            </button>
            <button
              type="submit"
              disabled={status === "saving"}
              className="inline-flex items-center justify-center rounded bg-primary px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-primary transition-colors hover:bg-primary-dim disabled:opacity-60"
            >
              {status === "saving" ? t("submitting") : t("submitButton")}
            </button>
          </div>
        </div>
      </form>
      <aside className="h-fit space-y-8 lg:sticky lg:top-24">
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-high/30 p-8 shadow-archival">
          <h3 className="border-b border-outline-variant/20 pb-4 font-headline text-lg text-primary">
            {t("guidelinesTitle")}
          </h3>
          <div className="mt-5 space-y-5">
            <div className="flex gap-3">
              <Icon name="verified_user" className="text-primary" />
              <p className="text-sm text-on-surface-variant">{t("guideline1")}</p>
            </div>
            <div className="flex gap-3">
              <Icon name="photo_library" className="text-primary" />
              <p className="text-sm text-on-surface-variant">{t("guideline2")}</p>
            </div>
            <div className="flex gap-3">
              <Icon name="local_library" className="text-primary" />
              <p className="text-sm text-on-surface-variant">{t("guideline3")}</p>
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
            <p className="font-headline text-2xl leading-snug text-on-primary">
              {t("sidebarCaption")}
            </p>
          </div>
        </div>
      </aside>
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
