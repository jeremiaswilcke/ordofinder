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

type LocationSource = "user" | "city" | "none";
type PermissionState = "idle" | "prompting" | "granted" | "denied" | "unsupported";

interface Props {
  churches: Church[];
  locale: string;
  cityCenter?: { latitude: number; longitude: number } | null;
  horizonDays?: number;
  limit?: number;
}

function averageCenter(churches: Church[]): { latitude: number; longitude: number } | null {
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

export function UpcomingMasses({
  churches,
  locale,
  cityCenter,
  horizonDays = 14,
  limit = 12,
}: Props) {
  const t = useTranslations("masses");
  const [now, setNow] = React.useState<Date | null>(null);
  const [coords, setCoords] = React.useState<
    { latitude: number; longitude: number } | null
  >(null);
  const [source, setSource] = React.useState<LocationSource>("none");
  const [permission, setPermission] = React.useState<PermissionState>("idle");

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
    // Re-tick every minute so "in 5 minutes" stays accurate.
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

  const upcoming: UpcomingMass[] = React.useMemo(() => {
    if (!now) return [];
    return computeUpcomingMasses(churches, { from: now, horizonDays, limit });
  }, [churches, now, horizonDays, limit]);

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
            {t("heading")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
            {t("subtitle")}
          </p>
        </div>

        <LocationControl
          source={source}
          permission={permission}
          onRequest={requestLocation}
          t={t}
        />
      </header>

      {now === null ? (
        <p className="text-sm text-on-surface-variant">{t("loading")}</p>
      ) : upcoming.length === 0 ? (
        <p className="text-sm text-on-surface-variant">{t("empty")}</p>
      ) : (
        <ol className="divide-y divide-outline-variant/40">
          {upcoming.map((entry, idx) => (
            <MassRow
              key={`${entry.church.slug}-${entry.massTime.weekday}-${entry.massTime.startTime}-${idx}`}
              entry={entry}
              now={now}
              coords={coords}
              locale={locale}
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
}: {
  entry: UpcomingMass;
  now: Date;
  coords: { latitude: number; longitude: number } | null;
  locale: string;
}) {
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

  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4 md:grid-cols-[auto_1fr_auto_auto]">
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
          {massTime.language.toUpperCase()} ·{" "}
          {formFormLabel(massTime.form)}
          {massTime.notes ? ` · ${massTime.notes}` : ""}
        </div>
      </div>

      <div className="hidden min-w-0 text-right md:block">
        <div className="text-xs uppercase tracking-[0.15em] text-outline">
          {church.address.split(",")[0]}
        </div>
      </div>

      <div className="text-right">
        <div className="font-headline text-sm text-on-surface md:text-base">
          {distance === null ? "—" : formatDistanceKm(distance, locale)}
        </div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-outline">
          {distance === null ? "" : distanceHint(distance)}
        </div>
      </div>
    </li>
  );
}

function distanceHint(km: number): string {
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
