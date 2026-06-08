import Link from "next/link";
import type { Corral } from "@prisma/client";
import { Card } from "@/components/ui";
import { Field, Input, Textarea, SubmitButton } from "@/components/forms";
import { RanchSelect } from "@/components/RanchSelect";

export function CorralForm({
  action,
  corral,
  haciendas,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  corral?: Corral | null;
  haciendas: { id: number; name: string }[];
  submitLabel: string;
}) {
  return (
    <form action={action}>
      <Card className="space-y-5 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Número de corral">
            <Input name="number" defaultValue={corral?.number ?? ""} />
          </Field>
          <Field label="Hacienda">
            <RanchSelect haciendas={haciendas} defaultValue={corral?.ranch} />
          </Field>
          <Field label="Latitud" hint="Ej. 14.0723">
            <Input
              type="number"
              step="any"
              name="latitude"
              defaultValue={corral?.latitude ?? ""}
            />
          </Field>
          <Field label="Longitud" hint="Ej. -87.1921">
            <Input
              type="number"
              step="any"
              name="longitude"
              defaultValue={corral?.longitude ?? ""}
            />
          </Field>
        </div>
        <Field label="Comentario">
          <Textarea name="comment" defaultValue={corral?.comment ?? ""} />
        </Field>
        <div className="flex items-center gap-3 pt-1">
          <SubmitButton>{submitLabel}</SubmitButton>
          <Link
            href={corral ? `/corrals/${corral.id}` : "/corrals"}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </Link>
        </div>
      </Card>
    </form>
  );
}
