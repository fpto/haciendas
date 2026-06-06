import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updatePlotEvaluation } from "@/actions/plotEvaluations";
import { PlotEvaluationForm } from "@/components/entity-forms/PlotEvaluationForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function EditPlotEvaluationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const evalId = Number(id);
  if (Number.isNaN(evalId)) notFound();

  const [evaluation, plots] = await Promise.all([
    prisma.plotEvaluation.findUnique({ where: { id: evalId } }),
    prisma.plot.findMany({
      orderBy: [{ ranch: "asc" }, { number: "asc" }],
      select: { id: true, number: true, ranch: true, plotType: true },
    }),
  ]);
  if (!evaluation) notFound();

  return (
    <div>
      <Link
        href={`/plot_evaluations/${evaluation.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Evaluación
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Editar evaluación
      </h1>
      <PlotEvaluationForm
        action={updatePlotEvaluation.bind(null, evaluation.id)}
        evaluation={evaluation}
        plots={plots}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
