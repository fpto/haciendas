import Link from "next/link";
import type { Hacienda } from "@prisma/client";
import { Card } from "@/components/ui";
import { Field, Input, Textarea, SubmitButton, FormError } from "@/components/forms";

export function HaciendaForm({
  action,
  hacienda,
  error,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hacienda?: Hacienda | null;
  error?: string;
  submitLabel: string;
}) {
  return (
    <form action={action}>
      <Card className="space-y-5 p-5 sm:p-6">
        <FormError message={error} />
        <Field label="Nombre de la hacienda">
          <Input
            name="name"
            defaultValue={hacienda?.name ?? ""}
            placeholder="Ej. Nueva Joya"
            required
          />
        </Field>
        <Field label="Ubicación" hint="Opcional">
          <Input
            name="location"
            defaultValue={hacienda?.location ?? ""}
            placeholder="Municipio, departamento…"
          />
        </Field>
        <Field label="Notas" hint="Opcional">
          <Textarea name="notes" defaultValue={hacienda?.notes ?? ""} />
        </Field>
        <div className="flex items-center gap-3 pt-1">
          <SubmitButton>{submitLabel}</SubmitButton>
          <Link
            href={hacienda ? `/haciendas/${hacienda.id}` : "/haciendas"}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </Link>
        </div>
      </Card>
    </form>
  );
}
