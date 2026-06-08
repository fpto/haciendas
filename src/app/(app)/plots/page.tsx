import Link from "next/link";
import { prisma } from "@/lib/db";
import { getLatestPlotScores } from "@/lib/queries";
import { EmptyState, TableWrap, Th, Td, Card, Badge } from "@/components/ui";
import { PlotIcon, ChevronRightIcon, PlusIcon } from "@/components/icons";
import { fmtNumber } from "@/lib/utils";
import { getCurrentUser, isEditor } from "@/lib/auth";

export const dynamic = "force-dynamic";

function scoreColor(avg: number | null): "green" | "amber" | "red" | "slate" {
  if (avg === null) return "slate";
  if (avg >= 4) return "green";
  if (avg >= 2.5) return "amber";
  return "red";
}

export default async function PlotsPage() {
  const [plots, scores, user] = await Promise.all([
    prisma.plot.findMany({
      orderBy: [{ number: "asc" }],
      include: { _count: { select: { evaluations: true } } },
    }),
    getLatestPlotScores(),
    getCurrentUser(),
  ]);
  const canEdit = isEditor(user?.role);
  const scoreByPlot = new Map(scores.map((s) => [s.plot_id, s]));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Potreros
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {fmtNumber(plots.length)} potreros registrados
          </p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Link
              href="/plots/import"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
            >
              <PlotIcon width={18} height={18} />
              Importar KMZ
            </Link>
            <Link
              href="/plots/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98]"
            >
              <PlusIcon width={18} height={18} />
              Nuevo potrero
            </Link>
          </div>
        )}
      </div>

      {plots.length === 0 ? (
        <EmptyState
          icon={<PlotIcon width={26} height={26} />}
          title="Sin potreros"
          description="Registra tus potreros para evaluar agua, pasto y cercas."
          action={canEdit ? { href: "/plots/new", label: "Nuevo potrero" } : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
            {plots.map((plot) => {
              const s = scoreByPlot.get(plot.id);
              return (
                <Link key={plot.id} href={`/plots/${plot.id}`}>
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">
                        Potrero {plot.number}
                      </p>
                      <Badge color={scoreColor(s?.average ?? null)}>
                        {fmtNumber(s?.average ?? null, 1)} / 5
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {plot.plotType ?? "Sin tipo"}
                      {plot.area ? ` · ${fmtNumber(plot.area, 1)} ha` : ""}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                      <Mini label="Agua" value={s?.water_score} />
                      <Mini label="Pasto" value={s?.pasture_score} />
                      <Mini label="Cercas" value={s?.fences_score} />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:block">
            <TableWrap>
              <thead>
                <tr>
                  <Th>Potrero</Th>
                  <Th>Tipo</Th>
                  <Th className="text-right">Área (ha)</Th>
                  <Th className="text-right">Agua</Th>
                  <Th className="text-right">Pasto</Th>
                  <Th className="text-right">Cercas</Th>
                  <Th className="text-right">Promedio</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {plots.map((plot) => {
                  const s = scoreByPlot.get(plot.id);
                  return (
                    <tr key={plot.id} className="hover:bg-slate-50">
                      <Td className="font-semibold text-slate-900">
                        {plot.number ?? plot.id}
                      </Td>
                      <Td className="capitalize">{plot.plotType ?? "—"}</Td>
                      <Td className="text-right">{fmtNumber(plot.area, 1)}</Td>
                      <Td className="text-right">{s?.water_score ?? "—"}</Td>
                      <Td className="text-right">{s?.pasture_score ?? "—"}</Td>
                      <Td className="text-right">{s?.fences_score ?? "—"}</Td>
                      <Td className="text-right">
                        <Badge color={scoreColor(s?.average ?? null)}>
                          {fmtNumber(s?.average ?? null, 2)}
                        </Badge>
                      </Td>
                      <Td>
                        <Link
                          href={`/plots/${plot.id}`}
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
          </div>
        </>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value?: number | null }) {
  return (
    <div className="rounded-lg bg-slate-50 py-1.5">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold">{value ?? "—"}</p>
    </div>
  );
}
