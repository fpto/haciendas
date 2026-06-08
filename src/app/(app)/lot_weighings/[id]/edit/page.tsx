import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getWeightUnit } from "@/lib/units";
import { updateLotWeighing } from "@/actions/lotWeighings";
import { LotWeighingForm } from "@/components/entity-forms/LotWeighingForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function EditLotWeighingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const weighingId = Number(id);
  if (Number.isNaN(weighingId)) notFound();

  const [weighing, lots, unit] = await Promise.all([
    prisma.lotWeighing.findUnique({ where: { id: weighingId } }),
    prisma.lot.findMany({
      orderBy: [{ ranch: "asc" }, { number: "asc" }],
      select: { id: true, number: true, name: true, ranch: true },
    }),
    getWeightUnit(),
  ]);
  if (!weighing) notFound();

  return (
    <div>
      <Link
        href={weighing.lotId ? `/lots/${weighing.lotId}` : "/lots"}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Volver
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Editar pesado de lote
      </h1>
      <LotWeighingForm
        action={updateLotWeighing.bind(null, weighing.id)}
        weighing={weighing}
        lots={lots}
        unit={unit}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
