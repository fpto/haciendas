"use client";

import { useState } from "react";
import type { Lot } from "@prisma/client";
import { Field, Input, Select, Textarea } from "@/components/forms";
import { toDateInput } from "@/lib/utils";
import {
  LOT_STATUSES,
  normalizeLotStatus,
  type LotStatus,
} from "@/lib/lotStatus";

// Selector de estado del lote (en crecimiento / vendido / destruido) y, cuando
// el lote está "vendido", los datos de la venta. Es un componente cliente para
// revelar la sección de venta solo al elegir el estado "Vendido".
export function LotStatusFields({ lot }: { lot?: Lot | null }) {
  const [status, setStatus] = useState<LotStatus>(
    normalizeLotStatus(lot?.status),
  );

  return (
    <div className="space-y-5">
      <Field
        label="Estado del lote"
        hint="Solo los lotes en crecimiento cuentan como inventario activo en engorde."
      >
        <Select
          name="status"
          value={status}
          onChange={(e) => setStatus(normalizeLotStatus(e.target.value))}
        >
          {LOT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </Field>

      {status === "sold" && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-4">
          <p className="text-sm font-semibold text-blue-900">Datos de la venta</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Fecha de venta">
              <Input
                type="date"
                name="sale_date"
                defaultValue={toDateInput(lot?.saleDate)}
              />
            </Field>
            <Field label="Comprador">
              <Input name="buyer" defaultValue={lot?.buyer ?? ""} />
            </Field>
            <Field label="Precio de venta" hint="Por libra">
              <Input
                type="number"
                step="0.01"
                min="0"
                name="sale_price"
                defaultValue={lot?.salePrice ?? ""}
              />
            </Field>
          </div>
          <Field label="Comentario de venta">
            <Textarea
              name="sale_comment"
              defaultValue={lot?.saleComment ?? ""}
            />
          </Field>
        </div>
      )}
    </div>
  );
}
