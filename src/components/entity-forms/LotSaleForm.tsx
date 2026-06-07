import Link from "next/link";
import { Card } from "@/components/ui";
import { Field, Input, Select, Textarea, SubmitButton } from "@/components/forms";

// Formulario de venta en modo "Por Lote": se elige un lote disponible (en
// crecimiento) y se capturan los datos de la venta. Al enviar, el lote queda
// marcado como vendido.
export function LotSaleForm({
  action,
  lots,
  defaultLotId,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  lots: { id: number; label: string }[];
  defaultLotId?: number;
  submitLabel: string;
}) {
  return (
    <form action={action}>
      <Card className="space-y-5 p-5 sm:p-6">
        <Field
          label="Lote a vender"
          hint="Solo se listan los lotes en crecimiento de la hacienda activa."
        >
          <Select name="lot_id" defaultValue={defaultLotId ?? ""} required>
            <option value="" disabled>
              — Selecciona un lote —
            </option>
            {lots.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Fecha de venta">
            <Input type="date" name="sale_date" />
          </Field>
          <Field label="Comprador">
            <Input name="buyer" />
          </Field>
          <Field label="Precio de venta" hint="Por libra">
            <Input type="number" step="0.01" min="0" name="sale_price" />
          </Field>
        </div>

        <Field label="Comentario de venta">
          <Textarea name="sale_comment" />
        </Field>

        <div className="flex items-center gap-3 pt-1">
          <SubmitButton>{submitLabel}</SubmitButton>
          <Link
            href="/sales"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </Link>
        </div>
      </Card>
    </form>
  );
}
