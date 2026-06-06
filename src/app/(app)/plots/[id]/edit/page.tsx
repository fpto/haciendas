import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updatePlot } from "@/actions/plots";
import { PlotForm } from "@/components/entity-forms/PlotForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function EditPlotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const plotId = Number(id);
  if (Number.isNaN(plotId)) notFound();
  const plot = await prisma.plot.findUnique({ where: { id: plotId } });
  if (!plot) notFound();

  return (
    <div>
      <Link
        href={`/plots/${plot.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Potrero {plot.number}
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Editar potrero
      </h1>
      <PlotForm
        action={updatePlot.bind(null, plot.id)}
        plot={plot}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
