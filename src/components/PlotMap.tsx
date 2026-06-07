"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// Mapa satelital con el polígono del potrero dibujado.
// `ring` son los vértices en formato GeoJSON [lng, lat]. Leaflet se carga de
// forma diferida (solo en el cliente) para evitar acceder a `window` en SSR.
export function PlotMap({ ring }: { ring: [number, number][] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ring || ring.length < 3) return;
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
          attribution:
            "Imágenes &copy; Esri, Maxar, Earthstar Geographics",
        },
      ).addTo(map);

      // Etiquetas de carreteras/lugares encima del satélite.
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, opacity: 0.9 },
      ).addTo(map);

      // GeoJSON usa [lng, lat]; Leaflet usa [lat, lng].
      const latlngs = ring.map(
        ([lng, lat]) => [lat, lng] as [number, number],
      );
      const polygon = L.polygon(latlngs, {
        color: "#22c55e",
        weight: 3,
        fillColor: "#22c55e",
        fillOpacity: 0.15,
      }).addTo(map);

      map.fitBounds(polygon.getBounds(), { padding: [24, 24] });
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [ring]);

  return (
    <div
      ref={containerRef}
      className="h-80 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-96"
    />
  );
}
