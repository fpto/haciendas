// Helpers para convertir valores de FormData a tipos del modelo.

export function str(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

export function int(v: FormDataEntryValue | null): number | null {
  const s = str(v);
  if (s === null) return null;
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? null : n;
}

export function float(v: FormDataEntryValue | null): number | null {
  const s = str(v);
  if (s === null) return null;
  const n = parseFloat(s);
  return Number.isNaN(n) ? null : n;
}

export function date(v: FormDataEntryValue | null): Date | null {
  const s = str(v);
  if (s === null) return null;
  // Inputs date llegan como "YYYY-MM-DD"; los anclamos a UTC.
  const d = new Date(s + "T00:00:00.000Z");
  return Number.isNaN(d.getTime()) ? null : d;
}
