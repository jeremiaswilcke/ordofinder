"use client";

import { useEffect, useRef } from "react";

export type MapMarker = {
  slug: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  overall: number;
};

type Props = {
  locale: string;
  markers: MapMarker[];
  emptyMessage: string;
};

export function ArchiveMap({ locale, markers, emptyMessage }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let mapInstance: { remove: () => void } | null = null;

    async function bootMap() {
      if (!ref.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet.markercluster");

      if (cancelled || !ref.current) return;

      const hasMarkers = markers.length > 0;
      const initialCenter: [number, number] = hasMarkers
        ? [markers[0].latitude, markers[0].longitude]
        : [33, 11];
      const initialZoom = hasMarkers ? 4 : 2;

      const map = L.map(ref.current, { zoomControl: true }).setView(
        initialCenter,
        initialZoom,
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      if (hasMarkers) {
        const clusterGroup = L.markerClusterGroup();
        const bounds: [number, number][] = [];

        markers.forEach((marker) => {
          const m = L.marker([marker.latitude, marker.longitude]);
          const href = `/${locale}/church/${marker.slug}`;
          const scoreLine =
            marker.overall > 0
              ? `<br/>${marker.overall.toFixed(1)}/10`
              : "";
          m.bindPopup(
            `<div>
              <strong>${escapeHtml(marker.name)}</strong><br/>
              ${escapeHtml(marker.city)}${scoreLine}<br/>
              <a href="${href}" style="color:#3b4a5e;text-decoration:underline">Open</a>
            </div>`,
          );
          clusterGroup.addLayer(m);
          bounds.push([marker.latitude, marker.longitude]);
        });

        map.addLayer(clusterGroup);
        if (bounds.length > 1) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
        }
      }

      mapInstance = map;
    }

    void bootMap();

    return () => {
      cancelled = true;
      mapInstance?.remove();
    };
  }, [locale, markers]);

  return (
    <div className="relative h-[70vh] overflow-hidden rounded-xl border border-outline-variant/40">
      <div ref={ref} className="h-full w-full" />
      {markers.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="pointer-events-auto rounded-lg border border-outline-variant/40 bg-surface-container-lowest/90 px-6 py-4 text-center shadow-archival backdrop-blur-sm">
            <p className="font-headline text-lg text-on-surface">{emptyMessage}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
