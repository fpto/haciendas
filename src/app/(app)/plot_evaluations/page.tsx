import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader, EmptyState, TableWrap, Th, Td } from "@/components/ui";
import { CalendarIcon, ChevronRightIcon } from "@/components/icons";
import { fmtNumber, fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PlotEvaluationsPage() {
  const evaluations = await prisma.plotEvaluation.findMany({
    orderBy: { date: "desc" },
    include: { plot: true },
  });

  return (
    <div>
      <PageHeader
        title="Evaluaciones de potrero"
        subtitle={`${fmtNumber(evaluations.length)} evaluaciones`}
        action={{ href: "/plot_evaluations/new", label: "Nueva evaluación" }}
      />

      {evaluations.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon width={26} height={26} />}
          title="Sin evaluaciones"
          description="Registra evaluaciones de agua, pasto y cercas de tus potreros."
          action={{ href: "/plot_evaluations/new", label: "Nueva evaluación" }}
        />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Fecha</Th>
              <Th>Potrero</Th>
              <Th className="text-right">Agua</Th>
              <Th className="text-right">Pasto</Th>
              <Th className="text-right">Cercas</Th>
              <Th className="text-right">Promedio</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((e) => {
              const avg =
                e.waterScore !== null &&
                e.pastureScore !== null &&
                e.fencesScore !== null
                  ? (e.waterScore + e.pastureScore + e.fencesScore) / 3
                  : null;
              return (
                <tr key={e.id} className="hover:bg-slate-50">
                  <Td>{fmtDate(e.date)}</Td>
                  <Td className="font-semibold text-slate-900">
                    {e.plot ? `Potrero ${e.plot.number}` : "—"}
                  </Td>
                  <Td className="text-right">{e.waterScore ?? "—"}</Td>
                  <Td className="text-right">{e.pastureScore ?? "—"}</Td>
                  <Td className="text-right">{e.fencesScore ?? "—"}</Td>
                  <Td className="text-right font-semibold">{fmtNumber(avg, 2)}</Td>
                  <Td>
                    <Link
                      href={`/plot_evaluations/${e.id}`}
                      className="inline-flex text-brand-600"
                    >
                      <ChevronRightIcon />
                    </Link>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
