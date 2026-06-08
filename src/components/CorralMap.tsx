"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// Mapa satelital con la ubicación puntual del corral marcada.
// `lat`/`lng` son las coordenadas del corral. Leaflet se carga de forma diferida
// (solo en el cliente) para evitar acceder a `window` en SSR.
export function CorralMap({ lat, lng }: { lat: number; lng: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
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
      }).setView([lat, lng], 16);

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

      // Marcador circular (evita depender de los íconos PNG de Leaflet, que no
      // se resuelven bien con el bundler).
      L.circleMarker([lat, lng], {
        radius: 9,
        color: "#f59e0b",
        weight: 3,
        fillColor: "#f59e0b",
        fillOpacity: 0.6,
      }).addTo(map);
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className="h-80 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-96"
    />
  );
}
