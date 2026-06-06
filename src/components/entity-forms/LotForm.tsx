import Link from "next/link";
import type { Lot } from "@prisma/client";
import { Card } from "@/components/ui";
import { Field, Input, Select, Textarea, SubmitButton } from "@/components/forms";

const SPECIES = ["bovino", "ovino", "caprino", "equino", "porcino"];

export function LotForm({
  action,
  lot,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  lot?: Lot | null;
  submitLabel: string;
}) {
  return (
    <form action={action}>
      <Card className="space-y-5 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Número de lote">
            <Input name="number" defaultValue={lot?.number ?? ""} />
          </Field>
          <Field label="Nombre">
            <Input name="name" defaultValue={lot?.name ?? ""} />
          </Field>
          <Field label="Hacienda / Rancho">
            <Input name="ranch" defaultValue={lot?.ranch ?? ""} />
          </Field>
          <Field label="Especie">
            <Select name="species" defaultValue={lot?.species ?? "bovino"}>
              {SPECIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Descripción">
          <Textarea name="description" defaultValue={lot?.description ?? ""} />
        </Field>
        <div className="flex items-center gap-3 pt-1">
          <SubmitButton>{submitLabel}</SubmitButton>
          <Link
            href={lot ? `/lots/${lot.id}` : "/lots"}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </Link>
        </div>
      </Card>
    </form>
  );
}
