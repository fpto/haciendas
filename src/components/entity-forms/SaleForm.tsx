import Link from "next/link";
import type { Sale } from "@prisma/client";
import { Card } from "@/components/ui";
import { Field, Input, Textarea, SubmitButton } from "@/components/forms";
import { toDateInput } from "@/lib/utils";

export function SaleForm({
  action,
  sale,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  sale?: Sale | null;
  submitLabel: string;
}) {
  return (
    <form action={action}>
      <Card className="space-y-5 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Fecha de venta">
            <Input
              type="date"
              name="date"
              defaultValue={toDateInput(sale?.date)}
            />
          </Field>
          <Field label="Comprador">
            <Input name="buyer" defaultValue={sale?.buyer ?? ""} />
          </Field>
        </div>
        <Field label="Comentario">
          <Textarea name="comment" defaultValue={sale?.comment ?? ""} />
        </Field>
        <div className="flex items-center gap-3 pt-1">
          <SubmitButton>{submitLabel}</SubmitButton>
          <Link
            href={sale ? `/sales/${sale.id}` : "/sales"}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </Link>
        </div>
      </Card>
    </form>
  );
}
