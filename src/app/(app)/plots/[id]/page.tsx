import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser, isAdmin, isEditor } from "@/lib/auth";
import { deletePlot } from "@/actions/plots";
import { Card, DescList, TableWrap, Th, Td, Badge, EmptyState } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { ArrowLeftIcon, EditIcon, PlusIcon, CalendarIcon } from "@/components/icons";
import { fmtNumber, fmtDate, lotHeadcount } from "@/lib/utils";
import { parseGeoJsonRing } from "@/lib/kml";
import { PlotMap } from "@/components/PlotMap";

export const dynamic = "force-dynamic";

export default async function PlotShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plotId = Number(id);
  if (Number.isNaN(plotId)) notFound();

  const [plot, user] = await Promise.all([
    prisma.plot.findUnique({
      where: { id: plotId },
      include: {
        evaluations: { orderBy: { date: "desc" } },
        lots: {
          select: {
            _count: { select: { animals: true } },
            weighings: {
              orderBy: [{ date: "desc" }, { id: "desc" }],
              take: 1,
              select: { animalCount: true },
            },
          },
        },
      },
    }),
    getCurrentUser(),
  ]);
  if (!plot) notFound();

  const canEdit = isEditor(user?.role);
  const canDelete = isAdmin(user?.role);
  const ring = parseGeoJsonRing(plot.boundaries);

  // Animales en el potrero: suma del número de animales de los lotes ubicados aquí.
  const animalCount = plot.lots.reduce((sum, lot) => sum + lotHeadcount(lot), 0);

  const details = [
    { label: "Número", value: plot.number ?? "—" },
    { label: "Hacienda", value: plot.ranch ?? "—" },
    {
      label: "Tipo",
      value: <span className="capitalize">{plot.plotType ?? "—"}</span>,
    },
    {
      label: "Animales",
      value: <Badge color="green">{fmtNumber(animalCount)}</Badge>,
    },
    { label: "Área", value: plot.area ? `${fmtNumber(plot.area, 2)} ha` : "—" },
    { label: "Comentario", value: plot.comment ?? "—" },
    // Solo mostramos los linderos como texto si no se pueden dibujar en el mapa.
    ...(ring
      ? []
      : [{ label: "Linderos", value: plot.boundaries ?? "—" }]),
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/plots"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeftIcon width={16} height={16} /> Potreros
        </Link>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/plots/${plot.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <EditIcon width={16} height={16} /> Editar
            </Link>
          )}
          {canDelete && <DeleteButton action={deletePlot} id={plot.id} />}
        </div>
      </div>

      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
        Potrero {plot.number}
      </h1>

      {ring && (
        <div className="mb-5">
          <PlotMap ring={ring} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <DescList items={details} />
        </Card>

        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Evaluaciones
            </h2>
            {canEdit && (
              <Link
                href={`/plot_evaluations/new?plot_id=${plot.id}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                <PlusIcon width={16} height={16} /> Nueva evaluación
              </Link>
            )}
          </div>

          {plot.evaluations.length === 0 ? (
            <EmptyState
              icon={<CalendarIcon width={24} height={24} />}
              title="Sin evaluaciones"
              description="Registra la primera evaluación de agua, pasto y cercas."
              action={canEdit ? { href: `/plot_evaluations/new?plot_id=${plot.id}`, label: "Nueva evaluación" } : undefined}
            />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Fecha</Th>
                  <Th className="text-right">Agua</Th>
                  <Th className="text-right">Pasto</Th>
                  <Th className="text-right">Cercas</Th>
                  <Th className="text-right">Promedio</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {plot.evaluations.map((e) => {
                  const avg =
                    e.waterScore !== null &&
                    e.pastureScore !== null &&
                    e.fencesScore !== null
                      ? (e.waterScore + e.pastureScore + e.fencesScore) / 3
                      : null;
                  return (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <Td>{fmtDate(e.date)}</Td>
                      <Td className="text-right">{e.waterScore ?? "—"}</Td>
                      <Td className="text-right">{e.pastureScore ?? "—"}</Td>
                      <Td className="text-right">{e.fencesScore ?? "—"}</Td>
                      <Td className="text-right font-semibold">
                        {fmtNumber(avg, 2)}
                      </Td>
                      <Td>
                        <Link
                          href={`/plot_evaluations/${e.id}`}
                          className="text-brand-600 hover:text-brand-700"
                        >
                          Ver
                        </Link>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </TableWrap>
          )}
        </div>
      </div>
    </div>
  );
}
