import Link from "next/link";
import type { Animal, Lot, Sale } from "@prisma/client";
import { Card } from "@/components/ui";
import { Field, Input, Select, SubmitButton } from "@/components/forms";
import { RanchSelect } from "@/components/RanchSelect";
import { toDateInput } from "@/lib/utils";

const SPECIES = ["bovino", "ovino", "caprino", "equino", "porcino"];
const STATUSES = ["engorde", "cría", "reproducción", "vendido", "muerto"];

export function AnimalForm({
  action,
  animal,
  lots,
  sales,
  haciendas,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  animal?: Animal | null;
  lots: Lot[];
  sales: Sale[];
  haciendas: { id: number; name: string }[];
  submitLabel: string;
}) {
  return (
    <form action={action}>
      <Card className="space-y-5 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Número de animal">
            <Input
              type="number"
              name="animal_number"
              defaultValue={animal?.animalNumber ?? ""}
              placeholder="Ej. 1024"
            />
          </Field>
          <Field label="Especie">
            <Select name="species" defaultValue={animal?.species ?? "bovino"}>
              {SPECIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Hacienda">
            <RanchSelect haciendas={haciendas} defaultValue={animal?.ranch} />
          </Field>
          <Field label="Estatus">
            <Select name="status" defaultValue={animal?.status ?? "engorde"}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Lote">
            <Select name="lot_id" defaultValue={animal?.lotId ?? ""}>
              <option value="">— Sin lote —</option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {[l.ranch, l.species, l.number].filter(Boolean).join(" · ")}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Venta">
            <Select name="sale_id" defaultValue={animal?.saleId ?? ""}>
              <option value="">— Sin venta —</option>
              {sales.map((s) => (
                <option key={s.id} value={s.id}>
                  {[
                    s.date ? toDateInput(s.date) : null,
                    s.buyer,
                  ]
                    .filter(Boolean)
                    .join(" · ") || `Venta #${s.id}`}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Raza">
            <Input name="breed" defaultValue={animal?.breed ?? ""} />
          </Field>
          <Field label="Proveedor">
            <Input name="provider" defaultValue={animal?.provider ?? ""} />
          </Field>
          <Field label="Marca / Arete">
            <Input name="mark" defaultValue={animal?.mark ?? ""} />
          </Field>
          <Field label="Color">
            <Input name="color" defaultValue={animal?.color ?? ""} />
          </Field>
          <Field label="Fecha de nacimiento">
            <Input
              type="date"
              name="birthday"
              defaultValue={toDateInput(animal?.birthday)}
            />
          </Field>
          <Field label="Precio de compra" hint="$/lb al ingreso">
            <Input
              type="number"
              step="0.01"
              name="purchase_price"
              defaultValue={animal?.purchasePrice ?? ""}
            />
          </Field>
          <Field label="Precio de venta" hint="$/lb a la salida">
            <Input
              type="number"
              step="0.01"
              name="sale_price"
              defaultValue={animal?.salePrice ?? ""}
            />
          </Field>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <SubmitButton>{submitLabel}</SubmitButton>
          <Link
            href={animal ? `/animals/${animal.id}` : "/animals"}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </Link>
        </div>
      </Card>
    </form>
  );
}
