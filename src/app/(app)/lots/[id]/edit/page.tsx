import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateLot } from "@/actions/lots";
import { LotForm } from "@/components/entity-forms/LotForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function EditLotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const lotId = Number(id);
  if (Number.isNaN(lotId)) notFound();
  const [lot, haciendas, plots, corrals] = await Promise.all([
    prisma.lot.findUnique({ where: { id: lotId } }),
    prisma.hacienda.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.plot.findMany({
      orderBy: [{ ranch: "asc" }, { number: "asc" }],
      select: { id: true, number: true, ranch: true, plotType: true },
    }),
    prisma.corral.findMany({
      orderBy: [{ ranch: "asc" }, { number: "asc" }],
      select: { id: true, number: true, ranch: true },
    }),
  ]);
  if (!lot) notFound();

  return (
    <div>
      <Link
        href={`/lots/${lot.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> {lot.name || `Lote ${lot.number}`}
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Editar lote
      </h1>
      <LotForm
        action={updateLot.bind(null, lot.id)}
        lot={lot}
        haciendas={haciendas}
        plots={plots}
        corrals={corrals}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
