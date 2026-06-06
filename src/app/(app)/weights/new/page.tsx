import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { createWeight } from "@/actions/weights";
import { WeightForm } from "@/components/entity-forms/WeightForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function NewWeightPage({
  searchParams,
}: {
  searchParams: Promise<{ animal_id?: string }>;
}) {
  await requireEditor();
  const { animal_id } = await searchParams;
  const animals = await prisma.animal.findMany({
    orderBy: [{ ranch: "asc" }, { animalNumber: "asc" }],
    select: { id: true, animalNumber: true, ranch: true, species: true },
  });

  return (
    <div>
      <Link
        href={animal_id ? `/animals/${animal_id}` : "/weights"}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Volver
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Registrar peso
      </h1>
      <WeightForm
        action={createWeight}
        animals={animals}
        defaultAnimalId={animal_id ? Number(animal_id) : undefined}
        submitLabel="Registrar peso"
      />
    </div>
  );
}
