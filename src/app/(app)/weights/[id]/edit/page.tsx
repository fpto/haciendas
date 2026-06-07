import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getWeightUnit } from "@/lib/units";
import { updateWeight } from "@/actions/weights";
import { WeightForm } from "@/components/entity-forms/WeightForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function EditWeightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const weightId = Number(id);
  if (Number.isNaN(weightId)) notFound();

  const [weight, animals, unit] = await Promise.all([
    prisma.weight.findUnique({ where: { id: weightId } }),
    prisma.animal.findMany({
      orderBy: [{ ranch: "asc" }, { animalNumber: "asc" }],
      select: { id: true, animalNumber: true, ranch: true, species: true },
    }),
    getWeightUnit(),
  ]);
  if (!weight) notFound();

  return (
    <div>
      <Link
        href={weight.animalId ? `/animals/${weight.animalId}` : "/weights"}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Volver
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Editar peso
      </h1>
      <WeightForm
        action={updateWeight.bind(null, weight.id)}
        weight={weight}
        animals={animals}
        unit={unit}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
