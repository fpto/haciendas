import Link from "next/link";
import type { Lot, Plot, Corral } from "@prisma/client";
import { Card } from "@/components/ui";
import { Field, Input, Select, Textarea, SubmitButton } from "@/components/forms";
import { RanchSelect } from "@/components/RanchSelect";
import { LotStatusFields } from "@/components/entity-forms/LotStatusFields";

export function LotForm({
  action,
  lot,
  haciendas,
  plots,
  corrals,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  lot?: Lot | null;
  haciendas: { id: number; name: string }[];
  plots: Pick<Plot, "id" | "number" | "ranch" | "plotType">[];
  corrals: Pick<Corral, "id" | "number" | "ranch">[];
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
          <Field label="Hacienda">
            <RanchSelect haciendas={haciendas} defaultValue={lot?.ranch} />
          </Field>
          <Field label="Potrero" hint="Ubicación del lote">
            <Select name="plot_id" defaultValue={lot?.plotId ?? ""}>
              <option value="">— Sin potrero —</option>
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {[p.ranch, p.plotType, p.number].filter(Boolean).join(" · ") ||
                    `#${p.id}`}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Corral" hint="Ubicación del lote">
            <Select name="corral_id" defaultValue={lot?.corralId ?? ""}>
              <option value="">— Sin corral —</option>
              {corrals.map((c) => (
                <option key={c.id} value={c.id}>
                  {[c.ranch, c.number].filter(Boolean).join(" · ") || `#${c.id}`}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Descripción">
          <Textarea name="description" defaultValue={lot?.description ?? ""} />
        </Field>
        <LotStatusFields lot={lot} />
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
