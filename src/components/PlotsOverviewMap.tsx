"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type PlotMarker = {
  id: number;
  label: string;
  // Anillo exterior en formato GeoJSON [lng, lat].
  ring: [number, number][];
  animalCount: number;
};

// Mapa satelital con TODOS los potreros dibujados y, en el centro de cada uno,
// un círculo con el número de animales que hay en ese potrero. Leaflet se carga
// de forma diferida (solo en el cliente) para evitar acceder a `window` en SSR.
export function PlotsOverviewMap({ plots }: { plots: PlotMarker[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const usable = plots.filter((p) => p.ring && p.ring.length >= 3);
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

      for (const p of usable) {
        // GeoJSON usa [lng, lat]; Leaflet usa [lat, lng].
        const latlngs = p.ring.map(
          ([lng, lat]) => [lat, lng] as [number, number],
        );
        const polygon = L.polygon(latlngs, {
          color: "#22c55e",
          weight: 2,
          fillColor: "#22c55e",
          fillOpacity: 0.12,
        }).addTo(map!);

        const pBounds = polygon.getBounds();
        bounds.extend(pBounds);

        // Círculo con el número de animales en el centro del potrero.
        // Solo se muestra cuando el potrero tiene animales; los potreros
        // con cero animales no llevan círculo.
        if (p.animalCount <= 0) continue;
        const icon = L.divIcon({
          className: "plot-count-marker",
          html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9999px;background:#16a34a;color:#fff;font-weight:700;font-size:13px;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);">${p.animalCount}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        L.marker(pBounds.getCenter(), { icon })
          .addTo(map!)
          .bindPopup(`<b>${p.label}</b><br/>${p.animalCount} animales`);
      }

      if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] });
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [plots]);

  return (
    <div
      ref={containerRef}
      className="h-[30rem] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-[36rem]"
    />
  );
}
