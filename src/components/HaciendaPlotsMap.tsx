"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type HaciendaPlot = {
  id: number;
  number: string | null;
  // Vértices en formato GeoJSON [lng, lat].
  ring: [number, number][];
};

// Mapa satelital con los polígonos de todos los potreros de una hacienda.
// Leaflet se carga de forma diferida (solo en el cliente) para evitar acceder a
// `window` durante el SSR.
export function HaciendaPlotsMap({ plots }: { plots: HaciendaPlot[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const drawable = plots.filter((p) => p.ring && p.ring.length >= 3);
    if (drawable.length === 0) return;
    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      const el = containerRef.current;
      if (!el || cancelled) return;
      // Evita reinicializar sobre un contenedor ya usado (StrictMode).
      if ((el as unknown as { _leaflet_id?: number })._leaflet_id) return;

      map = L.map(el, {
        scrollWheelZoom: false,
        attributionControl: true,
      });

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

      const group = L.featureGroup();

      for (const plot of drawable) {
        // GeoJSON usa [lng, lat]; Leaflet usa [lat, lng].
        const latlngs = plot.ring.map(
          ([lng, lat]) => [lat, lng] as [number, number],
        );
        const polygon = L.polygon(latlngs, {
          color: "#22c55e",
          weight: 3,
          fillColor: "#22c55e",
          fillOpacity: 0.15,
        });

        const label = plot.number ? `Potrero ${plot.number}` : "Potrero";
        // Etiqueta permanente con el número del potrero, centrada en el polígono.
        polygon.bindTooltip(label, {
          permanent: true,
          direction: "center",
          className: "potrero-label",
        });
        // Enlace a la página del potrero al hacer clic.
        polygon.bindPopup(
          `<a href="/plots/${plot.id}" style="color:#16a34a;font-weight:600;">${label} →</a>`,
        );
        polygon.addTo(group);
      }

      group.addTo(map);
      map.fitBounds(group.getBounds(), { padding: [24, 24] });
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [plots]);

  return (
    <div
      ref={containerRef}
      className="h-80 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-[28rem]"
    />
  );
}
