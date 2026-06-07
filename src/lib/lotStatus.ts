// Estado de un lote en el modo de medición "Por Lote".
//
//   - "growing"   -> En crecimiento: el lote sigue en engorde. Cuenta como
//                    inventario activo en las métricas de bovinos.
//   - "sold"      -> Vendido: el lote se vendió. Se capturan los datos de la
//                    venta (fecha, comprador, precio por kg y comentario).
//   - "destroyed" -> Destruido: el lote se dio de baja (muerte, decomiso, etc.).
//
// El valor se guarda en la columna lots.status.

export type LotStatus = "growing" | "sold" | "destroyed";

export const DEFAULT_LOT_STATUS: LotStatus = "growing";

export const LOT_STATUSES: {
  value: LotStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "growing",
    label: "En crecimiento",
    description: "El lote sigue en engorde y cuenta como inventario activo.",
  },
  {
    value: "sold",
    label: "Vendido",
    description:
      "El lote se vendió. Registra la fecha, el comprador y el precio de venta.",
  },
  {
    value: "destroyed",
    label: "Destruido",
    description:
      "El lote se dio de baja (muerte, decomiso u otra pérdida) y deja el inventario.",
  },
];

export function normalizeLotStatus(
  value: string | null | undefined,
): LotStatus {
  if (value === "sold" || value === "destroyed") return value;
  return "growing";
}

export function lotStatusLabel(value: string | null | undefined): string {
  return LOT_STATUSES.find((s) => s.value === normalizeLotStatus(value))!.label;
}

export function lotStatusBadgeColor(
  value: string | null | undefined,
): "green" | "blue" | "red" {
  switch (normalizeLotStatus(value)) {
    case "sold":
      return "blue";
    case "destroyed":
      return "red";
    default:
      return "green";
  }
}
