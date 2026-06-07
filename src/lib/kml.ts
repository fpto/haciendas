import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";

export type ParsedPolygon = {
  name: string;
  description: string | null;
  // Anillo exterior como pares [lng, lat] (formato GeoJSON).
  ring: [number, number][];
  areaHectares: number | null;
};

const EARTH_RADIUS_M = 6378137;

// Área geodésica de un polígono (fórmula de exceso esférico) en hectáreas.
function ringAreaHectares(ring: [number, number][]): number | null {
  if (ring.length < 3) return null;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  let total = 0;
  for (let i = 0; i < ring.length; i++) {
    const [lon1, lat1] = ring[i];
    const [lon2, lat2] = ring[(i + 1) % ring.length];
    total +=
      rad(lon2 - lon1) * (2 + Math.sin(rad(lat1)) + Math.sin(rad(lat2)));
  }
  const areaM2 = Math.abs((total * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2);
  return areaM2 / 10000;
}

// Convierte el texto de <coordinates> (lon,lat,alt lon,lat,alt ...) a [lng,lat][].
function parseCoordinates(raw: unknown): [number, number][] {
  if (raw === null || raw === undefined) return [];
  const text =
    typeof raw === "object" && raw !== null && "#text" in raw
      ? String((raw as { "#text": unknown })["#text"])
      : String(raw);
  const points: [number, number][] = [];
  for (const token of text.trim().split(/\s+/)) {
    if (!token) continue;
    const parts = token.split(",");
    const lon = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);
    if (!Number.isNaN(lon) && !Number.isNaN(lat)) points.push([lon, lat]);
  }
  return points;
}

// Extrae el anillo exterior del primer Polygon dentro de un Placemark.
function extractRing(placemark: Record<string, unknown>): [number, number][] {
  const polygons: unknown[] = [];
  const collectPolys = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    if (obj.Polygon) {
      const p = obj.Polygon;
      if (Array.isArray(p)) polygons.push(...p);
      else polygons.push(p);
    }
    if (obj.MultiGeometry) collectPolys(obj.MultiGeometry);
  };
  collectPolys(placemark);

  for (const poly of polygons) {
    if (!poly || typeof poly !== "object") continue;
    const outer = (poly as Record<string, unknown>).outerBoundaryIs as
      | Record<string, unknown>
      | undefined;
    const ring = outer?.LinearRing as Record<string, unknown> | undefined;
    const coords = ring?.coordinates;
    const parsed = parseCoordinates(coords);
    if (parsed.length >= 3) return parsed;
  }
  return [];
}

// Recorre el árbol KML recolectando todos los nodos Placemark.
function collectPlacemarks(node: unknown, out: Record<string, unknown>[]) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) collectPlacemarks(item, out);
    return;
  }
  const obj = node as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj)) {
    if (key === "Placemark") {
      if (Array.isArray(value)) out.push(...(value as Record<string, unknown>[]));
      else out.push(value as Record<string, unknown>);
    } else if (value && typeof value === "object") {
      collectPlacemarks(value, out);
    }
  }
}

function textOf(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "object" && "#text" in value)
    return String((value as { "#text": unknown })["#text"]).trim() || null;
  const s = String(value).trim();
  return s || null;
}

// Las descripciones de Google Earth suelen venir con HTML/CSS; lo limpiamos.
function stripHtml(value: string | null): string | null {
  if (!value) return value;
  const text = value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
  return text || null;
}

async function extractKmlText(bytes: Uint8Array): Promise<string> {
  // Un KMZ es un ZIP; intentamos descomprimir y tomar el primer .kml.
  try {
    const zip = await JSZip.loadAsync(bytes);
    const kmlEntry =
      zip.file(/\.kml$/i)[0] ?? zip.file("doc.kml") ?? null;
    if (kmlEntry) return await kmlEntry.async("string");
  } catch {
    // No era un ZIP válido: probablemente un .kml plano.
  }
  return new TextDecoder("utf-8").decode(bytes);
}

export async function parseKmzOrKml(
  bytes: Uint8Array,
): Promise<ParsedPolygon[]> {
  const xml = await extractKmlText(bytes);
  const parser = new XMLParser({
    ignoreAttributes: true,
    parseTagValue: false,
    trimValues: true,
  });
  const doc = parser.parse(xml);

  const placemarks: Record<string, unknown>[] = [];
  collectPlacemarks(doc, placemarks);

  const result: ParsedPolygon[] = [];
  for (const pm of placemarks) {
    const ring = extractRing(pm);
    if (ring.length < 3) continue; // sin polígono usable
    result.push({
      name: textOf(pm.name) ?? "Sin nombre",
      description: stripHtml(textOf(pm.description)),
      ring,
      areaHectares: ringAreaHectares(ring),
    });
  }
  return result;
}

// Parsea el campo `boundaries` (GeoJSON Polygon en texto) a un anillo [lng,lat][].
// Devuelve null si no es un polígono válido (p.ej. linderos heredados en texto).
export function parseGeoJsonRing(
  boundaries: string | null | undefined,
): [number, number][] | null {
  if (!boundaries) return null;
  try {
    const obj = JSON.parse(boundaries);
    const coords = obj?.coordinates?.[0];
    if (!Array.isArray(coords) || coords.length < 3) return null;
    const ring: [number, number][] = [];
    for (const pt of coords) {
      const lng = Number(pt?.[0]);
      const lat = Number(pt?.[1]);
      if (Number.isNaN(lng) || Number.isNaN(lat)) return null;
      ring.push([lng, lat]);
    }
    return ring;
  } catch {
    return null;
  }
}

// Serializa un anillo a GeoJSON Polygon (texto) para el campo `boundaries`.
export function ringToGeoJson(ring: [number, number][]): string {
  const closed =
    ring.length > 0 &&
    (ring[0][0] !== ring[ring.length - 1][0] ||
      ring[0][1] !== ring[ring.length - 1][1])
      ? [...ring, ring[0]]
      : ring;
  return JSON.stringify({ type: "Polygon", coordinates: [closed] });
}
