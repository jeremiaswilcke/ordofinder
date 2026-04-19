"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Church } from "@/lib/types";
import {
  computeUpcomingMasses,
  formatDateTime,
  formatRelativeTime,
  type UpcomingMass,
} from "@/lib/upcomingMasses";
import { haversineDistanceKm, formatDistanceKm } from "@/lib/geo";
import { ratingLabelKey } from "@/lib/utils";

type LocationSource = "user" | "city" | "none";
type PermissionState = "idle" | "prompting" | "granted" | "denied" | "unsupported";

type FormFilter = "all" | "novus_ordo" | "tridentine";
type WindowFilter = "all" | "soon" | "today";
type LanguageFilter = "all" | string;

interface Props {
  churches: Church[];
  locale: string;
  cityCenter?: { latitude: number; longitude: number } | null;
  horizonDays?: number;
  limit?: number;
  heading?: string;
  subtitle?: string;
}

function averageCenter(
  churches: Church[]
): { latitude: number; longitude: number } | null {
  const valid = churches.filter(
    (c) => Number.isFinite(c.latitude) && Number.isFinite(c.longitude)
  );
  if (valid.length === 0) return null;
  const sum = valid.reduce(
    (acc, c) => {
      acc.lat += c.latitude;
      acc.lng += c.longitude;
      return acc;
    },
    { lat: 0, lng: 0 }
  );
  return {
    latitude: sum.lat / valid.length,
    longitude: sum.lng / valid.length,
  };
}

function isSameLocalDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function UpcomingMasses({
  churches,
  locale,
  cityCenter,
  horizonDays = 14,
  limit = 30,
  heading,
  subtitle,
}: Props) {
  const t = useTranslations("masses");
  const [now, setNow] = React.useState<Date | null>(null);
  const [coords, setCoords] = React.useState<
    { latitude: number; longitude: number } | null
  >(null);
  const [source, setSource] = React.useState<LocationSource>("none");
  const [permission, setPermission] = React.useState<PermissionState>("idle");

  const [formFilter, setFormFilter] = React.useState<FormFilter>("all");
  const [windowFilter, setWindowFilter] = React.useState<WindowFilter>("all");
  const [languageFilter, setLanguageFilter] =
    React.useState<LanguageFilter>("all");

  const fallbackCenter = React.useMemo(
    () => cityCenter ?? averageCenter(churches),
    [cityCenter, churches]
  );

  React.useEffect(() => {
    setNow(new Date());
    if (fallbackCenter && !coords) {
      setCoords(fallbackCenter);
      setSource("city");
    }
    const i = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallbackCenter]);

  const requestLocation = React.useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setPermission("unsupported");
      return;
    }
    setPermission("prompting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setSource("user");
        setPermission("granted");
      },
      () => setPermission("denied"),
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: 5 * 60_000 }
    );
  }, []);

  const allUpcoming: UpcomingMass[] = React.useMemo(() => {
    if (!now) return [];
    return computeUpcomingMasses(churches, {
      from: now,
      horizonDays,
      limit: 200,
    });
  }, [churches, now, horizonDays]);

  const languages = React.useMemo(() => {
    const set = new Set<string>();
    for (const e of allUpcoming) set.add(e.massTime.language);
    return Array.from(set).sort();
  }, [allUpcoming]);

  const filtered = React.useMemo(() => {
    if (!now) return [];
    return allUpcoming
      .filter((e) => {
        if (formFilter !== "all" && e.massTime.form !== formFilter) return false;
        if (languageFilter !== "all" && e.massTime.language !== languageFilter)
          return false;
        const diffMs = e.when.getTime() - now.getTime();
        if (windowFilter === "soon" && diffMs > 2 * 60 * 60_000) return false;
        if (windowFilter === "today" && !isSameLocalDate(e.when, now))
          return false;
        return true;
      })
      .slice(0, limit);
  }, [allUpcoming, formFilter, languageFilter, windowFilter, limit, now]);

  if (churches.length === 0) return null;

  return (
    <section
      aria-labelledby="upcoming-masses-heading"
      className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-6 md:p-8"
    >
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
            {t("eyebrow")}
          </p>
          <h2
            id="upcoming-masses-heading"
            className="mt-2 font-headline text-2xl font-semibold text-primary md:text-3xl"
          >
            {heading ?? t("heading")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
            {subtitle ?? t("subtitle")}
          </p>
        </div>

        <LocationControl
          source={source}
          permission={permission}
          onRequest={requestLocation}
          t={t}
        />
      </header>

      <FilterBar
        formFilter={formFilter}
        windowFilter={windowFilter}
        languageFilter={languageFilter}
        languages={languages}
        onForm={setFormFilter}
        onWindow={setWindowFilter}
        onLanguage={setLanguageFilter}
        t={t}
      />

      {now === null ? (
        <p className="mt-6 text-sm text-on-surface-variant">{t("loading")}</p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-sm text-on-surface-variant">
          {allUpcoming.length === 0 ? t("empty") : t("emptyFiltered")}
        </p>
      ) : (
        <ol className="mt-4 divide-y divide-outline-variant/40">
          {filtered.map((entry, idx) => (
            <MassRow
              key={`${entry.church.slug}-${entry.massTime.weekday}-${entry.massTime.startTime}-${idx}`}
              entry={entry}
              now={now}
              coords={coords}
              locale={locale}
              t={t}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function MassRow({
  entry,
  now,
  coords,
  locale,
  t,
}: {
  entry: UpcomingMass;
  now: Date;
  coords: { latitude: number; longitude: number } | null;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const ratingsT = useTranslations("ratings");
  const { church, massTime, when } = entry;
  const distance = coords
    ? haversineDistanceKm(coords, {
        latitude: church.latitude,
        longitude: church.longitude,
      })
    : null;

  const diffMinutes = (when.getTime() - now.getTime()) / 60000;
  const isSoon = diffMinutes <= 60;
  const absolute = formatDateTime(when, locale);
  const relative = formatRelativeTime(when, now, locale);
  const rating = church.ratings.overall;

  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4 md:grid-cols-[auto_1fr_auto_auto_auto]">
      <div className="w-20 md:w-24">
        <div className="font-headline text-lg text-primary md:text-xl">
          {absolute}
        </div>
        <div
          className={`text-[11px] uppercase tracking-[0.18em] ${
            isSoon ? "text-primary" : "text-outline"
          }`}
        >
          {relative}
        </div>
      </div>

      <div className="min-w-0">
        <Link
          href={`/${locale}/church/${church.slug}`}
          className="block truncate font-headline text-base text-on-surface hover:underline md:text-lg"
        >
          {church.name}
        </Link>
        <div className="truncate text-xs text-on-surface-variant">
          {massTime.language.toUpperCase()}
          {formFormLabel(massTime.form)
            ? ` · ${formFormLabel(massTime.form)}`
            : ""}
          {massTime.notes ? ` · ${massTime.notes}` : ""}
        </div>
      </div>

      <div className="hidden text-right md:block">
        <div className="font-headline text-base text-on-surface">
          {rating.toFixed(1)}
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-outline">
          {ratingsT(ratingLabelKey(rating) as never)}
        </div>
      </div>

      <div className="hidden text-right md:block">
        <div className="text-xs uppercase tracking-[0.15em] text-outline">
          {church.address.split(",")[0]}
        </div>
      </div>

      <div className="text-right">
        <div className="font-headline text-sm text-on-surface md:text-base">
          {distance === null ? "—" : formatDistanceKm(distance, locale)}
        </div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-outline">
          {distance === null ? "" : t(`distanceHint.${distanceHint(distance)}`)}
        </div>
      </div>
    </li>
  );
}

function distanceHint(km: number): "nearby" | "walk" | "transit" | "far" {
  if (km < 1) return "nearby";
  if (km < 5) return "walk";
  if (km < 20) return "transit";
  return "far";
}

function formFormLabel(form: string): string {
  switch (form) {
    case "novus_ordo":
      return "Novus Ordo";
    case "tridentine":
      return "Usus Antiquior";
    default:
      return "";
  }
}

function FilterBar({
  formFilter,
  windowFilter,
  languageFilter,
  languages,
  onForm,
  onWindow,
  onLanguage,
  t,
}: {
  formFilter: FormFilter;
  windowFilter: WindowFilter;
  languageFilter: LanguageFilter;
  languages: string[];
  onForm: (v: FormFilter) => void;
  onWindow: (v: WindowFilter) => void;
  onLanguage: (v: LanguageFilter) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-outline-variant/40 py-3">
      <FilterGroup label={t("filter.window")}>
        <Pill active={windowFilter === "all"} onClick={() => onWindow("all")}>
          {t("filter.windowAll")}
        </Pill>
        <Pill active={windowFilter === "soon"} onClick={() => onWindow("soon")}>
          {t("filter.windowSoon")}
        </Pill>
        <Pill
          active={windowFilter === "today"}
          onClick={() => onWindow("today")}
        >
          {t("filter.windowToday")}
        </Pill>
      </FilterGroup>

      <FilterGroup label={t("filter.form")}>
        <Pill active={formFilter === "all"} onClick={() => onForm("all")}>
          {t("filter.formAll")}
        </Pill>
        <Pill
          active={formFilter === "novus_ordo"}
          onClick={() => onForm("novus_ordo")}
        >
          Novus Ordo
        </Pill>
        <Pill
          active={formFilter === "tridentine"}
          onClick={() => onForm("tridentine")}
        >
          Usus Antiquior
        </Pill>
      </FilterGroup>

      {languages.length > 1 && (
        <FilterGroup label={t("filter.language")}>
          <Pill
            active={languageFilter === "all"}
            onClick={() => onLanguage("all")}
          >
            {t("filter.languageAll")}
          </Pill>
          {languages.map((lang) => (
            <Pill
              key={lang}
              active={languageFilter === lang}
              onClick={() => onLanguage(lang)}
            >
              {lang.toUpperCase()}
            </Pill>
          ))}
        </FilterGroup>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.18em] text-outline">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm border px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] transition ${
        active
          ? "border-primary bg-primary text-on-primary"
          : "border-outline/50 bg-surface text-on-surface-variant hover:border-primary hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function LocationControl({
  source,
  permission,
  onRequest,
  t,
}: {
  source: LocationSource;
  permission: PermissionState;
  onRequest: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  if (source === "user") {
    return (
      <span className="text-[11px] uppercase tracking-[0.18em] text-outline">
        {t("locationUser")}
      </span>
    );
  }

  if (permission === "denied" || permission === "unsupported") {
    return (
      <span className="text-[11px] uppercase tracking-[0.18em] text-outline">
        {t("locationFallback")}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onRequest}
      disabled={permission === "prompting"}
      className="rounded-sm border border-outline/60 bg-surface px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-on-surface transition hover:border-primary hover:text-primary disabled:opacity-50"
    >
      {permission === "prompting" ? t("locationPrompting") : t("locationCta")}
    </button>
  );
}
