// Modo de medición de peso de una hacienda.
//
//   - "lot"    -> Por Lote: se registra el peso promedio de cada lote
//                 (modelo LotWeighing).
//   - "animal" -> Por Animal: se registra el peso individual de cada animal
//                 (modelo Weight).
//
// El valor se guarda en la columna haciendas.weight_mode.

export type WeightMode = "lot" | "animal";

export const DEFAULT_WEIGHT_MODE: WeightMode = "lot";

export const WEIGHT_MODES: {
  value: WeightMode;
  label: string;
  description: string;
}[] = [
  {
    value: "lot",
    label: "Por Lote",
    description:
      "Se registra el peso promedio del lote completo en cada pesada. Más rápido para hatos grandes.",
  },
  {
    value: "animal",
    label: "Por Animal",
    description:
      "Se registra el peso individual de cada animal. Mayor detalle y seguimiento por cabeza.",
  },
];

export function normalizeWeightMode(
  value: string | null | undefined,
): WeightMode {
  return value === "animal" ? "animal" : "lot";
}

export function weightModeLabel(value: string | null | undefined): string {
  return normalizeWeightMode(value) === "animal" ? "Por Animal" : "Por Lote";
}
