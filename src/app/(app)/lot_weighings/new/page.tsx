import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { getWeightUnit } from "@/lib/units";
import { createLotWeighing } from "@/actions/lotWeighings";
import { LotWeighingForm } from "@/components/entity-forms/LotWeighingForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function NewLotWeighingPage({
  searchParams,
}: {
  searchParams: Promise<{ lot_id?: string }>;
}) {
  await requireEditor();
  const { lot_id } = await searchParams;
  const [lots, unit] = await Promise.all([
    prisma.lot.findMany({
      orderBy: [{ ranch: "asc" }, { number: "asc" }],
      select: { id: true, number: true, name: true, ranch: true, species: true },
    }),
    getWeightUnit(),
  ]);

  return (
    <div>
      <Link
        href={lot_id ? `/lots/${lot_id}` : "/lots"}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Volver
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Registrar pesado de lote
      </h1>
      <LotWeighingForm
        action={createLotWeighing}
        lots={lots}
        defaultLotId={lot_id ? Number(lot_id) : undefined}
        unit={unit}
        submitLabel="Registrar pesado"
      />
    </div>
  );
}
