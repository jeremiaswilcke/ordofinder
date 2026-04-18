"use client";

import { useEffect, useRef } from "react";
import { churches } from "@/lib/demo-data";

export function ArchiveMap() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let mapInstance: { remove: () => void } | null = null;

    async function bootMap() {
      if (!ref.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet.markercluster");

      if (cancelled || !ref.current) return;

      const map = L.map(ref.current, { zoomControl: true }).setView([33, 11], 2);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const clusterGroup = L.markerClusterGroup();

      churches.forEach((church) => {
        const marker = L.marker([church.latitude, church.longitude]);
        marker.bindPopup(
          `<div><strong>${church.name}</strong><br/>${church.city}<br/>${church.ratings.overall.toFixed(1)}/10</div>`,
        );
        clusterGroup.addLayer(marker);
      });

      map.addLayer(clusterGroup);
      mapInstance = map;
    }

    void bootMap();

    return () => {
      cancelled = true;
      mapInstance?.remove();
    };
  }, []);

  return <div ref={ref} className="h-[70vh] overflow-hidden rounded-xl border border-outline-variant/40" />;
}
