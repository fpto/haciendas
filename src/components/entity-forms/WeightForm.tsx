import Link from "next/link";
import type { Weight, Animal } from "@prisma/client";
import { Card } from "@/components/ui";
import { Field, Input, Select, Textarea, SubmitButton } from "@/components/forms";
import { toDateInput } from "@/lib/utils";

export function WeightForm({
  action,
  weight,
  animals,
  defaultAnimalId,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  weight?: Weight | null;
  animals: Pick<Animal, "id" | "animalNumber" | "ranch" | "species">[];
  defaultAnimalId?: number;
  submitLabel: string;
}) {
  const selectedAnimal = weight?.animalId ?? defaultAnimalId ?? "";
  return (
    <form action={action}>
      <Card className="space-y-5 p-5 sm:p-6">
        <Field label="Animal">
          <Select name="animal_id" defaultValue={selectedAnimal} required>
            <option value="">— Selecciona un animal —</option>
            {animals.map((a) => (
              <option key={a.id} value={a.id}>
                {[`#${a.animalNumber ?? a.id}`, a.ranch, a.species]
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
              defaultValue={toDateInput(weight?.date)}
              required
            />
          </Field>
          <Field label="Peso" hint="kilogramos">
            <Input
              type="number"
              step="0.1"
              name="weight"
              defaultValue={weight?.weight ?? ""}
              required
            />
          </Field>
        </div>
        <Field label="Nota">
          <Textarea name="note" defaultValue={weight?.note ?? ""} />
        </Field>
        <div className="flex items-center gap-3 pt-1">
          <SubmitButton>{submitLabel}</SubmitButton>
          <Link
            href={weight?.animalId ? `/animals/${weight.animalId}` : "/weights"}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </Link>
        </div>
      </Card>
    </form>
  );
}
