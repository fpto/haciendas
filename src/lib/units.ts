import { cookies } from "next/headers";
import { fmtNumber } from "@/lib/utils";

// Los pesos se almacenan SIEMPRE en kilogramos (canónico) y se muestran/capturan
// en la unidad preferida. La unidad por defecto es libras (lb).

export type WeightUnit = "kg" | "lb";

export const KG_TO_LB = 2.2046226218;
export const WEIGHT_UNIT_COOKIE = "weight_unit";

export async function getWeightUnit(): Promise<WeightUnit> {
  const store = await cookies();
  return store.get(WEIGHT_UNIT_COOKIE)?.value === "kg" ? "kg" : "lb";
}

// kg -> unidad seleccionada (aplica igual a pesos y a tasas kg/día).
export function convertFromKg(
  kg: number | null | undefined,
  unit: WeightUnit,
): number | null {
  if (kg === null || kg === undefined || Number.isNaN(Number(kg))) return null;
  return unit === "lb" ? Number(kg) * KG_TO_LB : Number(kg);
}

// valor capturado en la unidad seleccionada -> kg (para almacenar).
export function convertToKg(
  value: number | null | undefined,
  unit: WeightUnit,
): number | null {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return null;
  return unit === "lb" ? Number(value) / KG_TO_LB : Number(value);
}

export function weightLabel(unit: WeightUnit): string {
  return unit;
}

export function gainLabel(unit: WeightUnit): string {
  return `${unit}/día`;
}

// Formatea un peso en kg a "<valor> <unidad>".
export function fmtWeight(
  kg: number | null | undefined,
  unit: WeightUnit,
  decimals = 1,
): string {
  const v = convertFromKg(kg, unit);
  if (v === null) return "—";
  return `${fmtNumber(v, decimals)} ${unit}`;
}
