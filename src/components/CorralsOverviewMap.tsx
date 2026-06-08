"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type CorralMarker = {
  id: number;
  label: string;
  // Ubicación puntual del corral.
  lat: number;
  lng: number;
  animalCount: number;
};

// Mapa satelital con TODOS los corrales marcados en su ubicación puntual y, en
// cada uno, el número de cabezas que hay en ese corral. Leaflet se carga de
// forma diferida (solo en el cliente) para evitar acceder a `window` en SSR.
export function CorralsOverviewMap({ corrals }: { corrals: CorralMarker[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const usable = corrals.filter(
      (c) => Number.isFinite(c.lat) && Number.isFinite(c.lng),
    );
    if (usable.length === 0) return;
    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      const el = containerRef.current;
      if (!el || cancelled) return;
      // Evita reinicializar sobre un contenedor ya usado (StrictMode).
      if ((el as unknown as { _leaflet_id?: number })._leaflet_id) return;

      map = L.map(el, { scrollWheelZoom: false, attributionControl: true });

      // Imágenes satelitales (Esri World Imagery) — sin API key.
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution: "Imágenes &copy; Esri, Maxar, Earthstar Geographics",
        },
      ).addTo(map);

      // Etiquetas de carreteras/lugares encima del satélite.
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, opacity: 0.9 },
      ).addTo(map);

      const bounds = L.latLngBounds([]);

      for (const c of usable) {
        bounds.extend([c.lat, c.lng]);

        // Si el corral tiene cabezas, se muestra un círculo con el número; si
        // no, solo un punto que indica su ubicación.
        if (c.animalCount > 0) {
          const icon = L.divIcon({
            className: "corral-count-marker",
            html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9999px;background:#d97706;color:#fff;font-weight:700;font-size:13px;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);">${c.animalCount}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });
          L.marker([c.lat, c.lng], { icon })
            .addTo(map!)
            .bindPopup(`<b>${c.label}</b><br/>${c.animalCount} cabezas`);
        } else {
          L.circleMarker([c.lat, c.lng], {
            radius: 8,
            color: "#f59e0b",
            weight: 3,
            fillColor: "#f59e0b",
            fillOpacity: 0.6,
          })
            .addTo(map!)
            .bindPopup(`<b>${c.label}</b><br/>Sin cabezas`);
        }
      }

      if (bounds.isValid())
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [corrals]);

  return (
    <div
      ref={containerRef}
      className="h-[30rem] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-[36rem]"
    />
  );
}
