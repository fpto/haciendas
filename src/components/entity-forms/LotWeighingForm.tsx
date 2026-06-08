import Link from "next/link";
import type { LotWeighing, Lot } from "@prisma/client";
import { Card } from "@/components/ui";
import { Field, Input, Select, Textarea, SubmitButton } from "@/components/forms";
import { toDateInput } from "@/lib/utils";
import type { WeightUnit } from "@/lib/units";
import { convertFromKg } from "@/lib/units";

export function LotWeighingForm({
  action,
  weighing,
  lots,
  defaultLotId,
  unit,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  weighing?: LotWeighing | null;
  lots: Pick<Lot, "id" | "number" | "name" | "ranch">[];
  defaultLotId?: number;
  unit: WeightUnit;
  submitLabel: string;
}) {
  const selectedLot = weighing?.lotId ?? defaultLotId ?? "";
  // El peso promedio almacenado está en kg; se muestra para edición en la unidad elegida.
  const displayWeight =
    weighing?.averageWeight != null
      ? Math.round((convertFromKg(weighing.averageWeight, unit) ?? 0) * 10) / 10
      : "";
  return (
    <form action={action}>
      <Card className="space-y-5 p-5 sm:p-6">
        <Field label="Lote">
          <Select name="lot_id" defaultValue={selectedLot} required>
            <option value="">— Selecciona un lote —</option>
            {lots.map((l) => (
              <option key={l.id} value={l.id}>
                {[l.name || l.number || `#${l.id}`, l.ranch]
                  .filter(Boolean)
                  .join(" · ")}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Fecha">
            <Input
              type="date"
              name="date"
              defaultValue={toDateInput(weighing?.date)}
              required
            />
          </Field>
          <Field
            label="Peso promedio"
            hint={unit === "lb" ? "libras" : "kilogramos"}
          >
            <Input
              type="number"
              step="0.1"
              name="average_weight"
              defaultValue={displayWeight}
              required
            />
          </Field>
        </div>
        <Field label="Número de cabezas">
          <Input
            type="number"
            step="1"
            min="0"
            name="animal_count"
            defaultValue={weighing?.animalCount ?? ""}
          />
        </Field>
        <Field label="Notas">
          <Textarea name="note" defaultValue={weighing?.note ?? ""} />
        </Field>
        <div className="flex items-center gap-3 pt-1">
          <SubmitButton>{submitLabel}</SubmitButton>
          <Link
            href={weighing?.lotId ? `/lots/${weighing.lotId}` : "/lots"}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </Link>
        </div>
      </Card>
    </form>
  );
}
