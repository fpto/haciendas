import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateAnimal } from "@/actions/animals";
import { AnimalForm } from "@/components/entity-forms/AnimalForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function EditAnimalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const animalId = Number(id);
  if (Number.isNaN(animalId)) notFound();

  const [animal, lots, sales] = await Promise.all([
    prisma.animal.findUnique({ where: { id: animalId } }),
    prisma.lot.findMany({ orderBy: [{ ranch: "asc" }, { number: "asc" }] }),
    prisma.sale.findMany({ orderBy: { date: "desc" } }),
  ]);
  if (!animal) notFound();

  return (
    <div>
      <Link
        href={`/animals/${animal.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Animal #{animal.animalNumber ?? animal.id}
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Editar animal
      </h1>
      <AnimalForm
        action={updateAnimal.bind(null, animal.id)}
        animal={animal}
        lots={lots}
        sales={sales}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
