import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { createPlotEvaluation } from "@/actions/plotEvaluations";
import { PlotEvaluationForm } from "@/components/entity-forms/PlotEvaluationForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function NewPlotEvaluationPage({
  searchParams,
}: {
  searchParams: Promise<{ plot_id?: string }>;
}) {
  await requireEditor();
  const { plot_id } = await searchParams;
  const plots = await prisma.plot.findMany({
    orderBy: [{ ranch: "asc" }, { number: "asc" }],
    select: { id: true, number: true, ranch: true, plotType: true },
  });

  return (
    <div>
      <Link
        href="/plot_evaluations"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Evaluaciones
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Nueva evaluación
      </h1>
      <PlotEvaluationForm
        action={createPlotEvaluation}
        plots={plots}
        defaultPlotId={plot_id ? Number(plot_id) : undefined}
        submitLabel="Crear evaluación"
      />
    </div>
  );
}
