import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser, isAdmin, isEditor } from "@/lib/auth";
import { deletePlotEvaluation } from "@/actions/plotEvaluations";
import { Card, DescList, Badge } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { ArrowLeftIcon, EditIcon } from "@/components/icons";
import { fmtNumber, fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PlotEvaluationShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const evalId = Number(id);
  if (Number.isNaN(evalId)) notFound();

  const [evaluation, user] = await Promise.all([
    prisma.plotEvaluation.findUnique({
      where: { id: evalId },
      include: { plot: true },
    }),
    getCurrentUser(),
  ]);
  if (!evaluation) notFound();

  const avg =
    evaluation.waterScore !== null &&
    evaluation.pastureScore !== null &&
    evaluation.fencesScore !== null
      ? (evaluation.waterScore +
          evaluation.pastureScore +
          evaluation.fencesScore) /
        3
      : null;

  const canEdit = isEditor(user?.role);
  const canDelete = isAdmin(user?.role);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/plot_evaluations"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeftIcon width={16} height={16} /> Evaluaciones
        </Link>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/plot_evaluations/${evaluation.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <EditIcon width={16} height={16} /> Editar
            </Link>
          )}
          {canDelete && (
            <DeleteButton action={deletePlotEvaluation} id={evaluation.id} />
          )}
        </div>
      </div>

      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
        Evaluación · {fmtDate(evaluation.date)}
      </h1>

      <Card className="max-w-xl">
        <DescList
          items={[
            {
              label: "Potrero",
              value: evaluation.plot ? (
                <Link
                  href={`/plots/${evaluation.plot.id}`}
                  className="text-brand-600"
                >
                  Potrero {evaluation.plot.number}
                </Link>
              ) : (
                "—"
              ),
            },
            { label: "Fecha", value: fmtDate(evaluation.date) },
            { label: "Agua", value: evaluation.waterScore ?? "—" },
            { label: "Pasto", value: evaluation.pastureScore ?? "—" },
            { label: "Cercas", value: evaluation.fencesScore ?? "—" },
            {
              label: "Promedio",
              value: <Badge color="green">{fmtNumber(avg, 2)} / 5</Badge>,
            },
            { label: "Comentario", value: evaluation.comment ?? "—" },
          ]}
        />
      </Card>
    </div>
  );
}
