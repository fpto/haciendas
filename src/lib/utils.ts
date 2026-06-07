// Utilidades de formato compartidas por toda la UI.

export function fmtNumber(
  value: number | null | undefined,
  decimals = 0,
): string {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return "—";
  return Number(value).toLocaleString("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtMoney(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return "—";
  return Number(value).toLocaleString("es-HN", {
    style: "currency",
    currency: "HNL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function fmtPercent(
  value: number | null | undefined,
  decimals = 1,
): string {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return "—";
  return `${(Number(value) * 100).toFixed(decimals)}%`;
}

export function fmtDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// Convierte una fecha a "YYYY-MM-DD" para inputs <input type="date">.
export function toDateInput(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

// Serializa BigInt de forma segura cuando aparece en resultados de SQL crudo.
export function toNum(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "bigint") return Number(value);
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// Número de cabezas de un lote: se toma del último pesado (animalCount); si el
// lote aún no tiene pesados, se usa el conteo de animales registrados.
export function lotHeadcount(lot: {
  weighings: { animalCount: number | null }[];
  _count?: { animals: number };
}): number {
  const latest = lot.weighings[0];
  if (latest?.animalCount != null) return latest.animalCount;
  return lot._count?.animals ?? 0;
}
