import Link from "next/link";
import type { Plot } from "@prisma/client";
import { Card } from "@/components/ui";
import { Field, Input, Select, Textarea, SubmitButton } from "@/components/forms";
import { RanchSelect } from "@/components/RanchSelect";

const TYPES = ["pastoreo", "agrícola", "reserva", "corral"];

export function PlotForm({
  action,
  plot,
  haciendas,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  plot?: Plot | null;
  haciendas: { id: number; name: string }[];
  submitLabel: string;
}) {
  return (
    <form action={action}>
      <Card className="space-y-5 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Número de potrero">
            <Input name="number" defaultValue={plot?.number ?? ""} />
          </Field>
          <Field label="Área" hint="hectáreas">
            <Input
              type="number"
              step="0.01"
              name="area"
              defaultValue={plot?.area ?? ""}
            />
          </Field>
          <Field label="Hacienda">
            <RanchSelect haciendas={haciendas} defaultValue={plot?.ranch} />
          </Field>
          <Field label="Tipo">
            <Select name="plot_type" defaultValue={plot?.plotType ?? "pastoreo"}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Comentario">
          <Textarea name="comment" defaultValue={plot?.comment ?? ""} />
        </Field>
        <Field label="Linderos (boundaries)" hint="Texto o coordenadas">
          <Textarea name="boundaries" defaultValue={plot?.boundaries ?? ""} />
        </Field>
        <div className="flex items-center gap-3 pt-1">
          <SubmitButton>{submitLabel}</SubmitButton>
          <Link
            href={plot ? `/plots/${plot.id}` : "/plots"}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </Link>
        </div>
      </Card>
    </form>
  );
}
