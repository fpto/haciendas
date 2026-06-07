import Link from "next/link";
import { prisma } from "@/lib/db";
import { getLotStats } from "@/lib/queries";
import { PageHeader, EmptyState, TableWrap, Th, Td, Card } from "@/components/ui";
import { LotsIcon, ChevronRightIcon } from "@/components/icons";
import { fmtNumber } from "@/lib/utils";
import { getWeightUnit, convertFromKg, fmtWeight } from "@/lib/units";

export const dynamic = "force-dynamic";

export default async function LotsPage() {
  const [lots, stats, unit] = await Promise.all([
    prisma.lot.findMany({
      orderBy: [{ ranch: "asc" }, { species: "asc" }, { number: "asc" }],
      include: { _count: { select: { animals: true } } },
    }),
    getLotStats(),
    getWeightUnit(),
  ]);

  const statByLot = new Map(stats.map((s) => [s.lot_id, s]));

  return (
    <div>
      <PageHeader
        title="Lotes"
        subtitle={`${fmtNumber(lots.length)} lotes registrados`}
        action={{ href: "/lots/new", label: "Nuevo lote" }}
      />

      {lots.length === 0 ? (
        <EmptyState
          icon={<LotsIcon width={26} height={26} />}
          title="Sin lotes"
          description="Crea tu primer lote para agrupar y dar seguimiento a tus animales."
          action={{ href: "/lots/new", label: "Nuevo lote" }}
        />
      ) : (
        <>
          {/* Tarjetas móvil */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
            {lots.map((lot) => {
              const s = statByLot.get(lot.id);
              return (
                <Link key={lot.id} href={`/lots/${lot.id}`}>
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">
                        {lot.name || `Lote ${lot.number}`}
                      </p>
                      <span className="text-xs text-slate-400">
                        {lot._count.animals} animales
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {[lot.ranch, lot.species, lot.number]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-center text-sm">
                      <div className="rounded-lg bg-slate-50 py-1.5">
                        <p className="text-xs text-slate-400">Peso prom.</p>
                        <p className="font-semibold">
                          {fmtWeight(s?.average_weight ?? null, unit)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 py-1.5">
                        <p className="text-xs text-slate-400">GDP</p>
                        <p className="font-semibold">
                          {fmtNumber(convertFromKg(s?.daily_gain ?? null, unit), 2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Tabla escritorio */}
          <div className="hidden lg:block">
            <TableWrap>
              <thead>
                <tr>
                  <Th>Lote</Th>
                  <Th>Hacienda</Th>
                  <Th>Especie</Th>
                  <Th className="text-right">Animales</Th>
                  <Th className="text-right">Peso promedio</Th>
                  <Th className="text-right">Cambio</Th>
                  <Th className="text-right">GDP</Th>
                  <Th className="text-right">Días sin pesar</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => {
                  const s = statByLot.get(lot.id);
                  return (
                    <tr key={lot.id} className="hover:bg-slate-50">
                      <Td className="font-semibold text-slate-900">
                        {lot.name || lot.number || `#${lot.id}`}
                      </Td>
                      <Td>{lot.ranch ?? "—"}</Td>
                      <Td className="capitalize">{lot.species ?? "—"}</Td>
                      <Td className="text-right">{lot._count.animals}</Td>
                      <Td className="text-right">
                        {fmtWeight(s?.average_weight ?? null, unit)}
                      </Td>
                      <Td className="text-right">
                        {fmtWeight(s?.weight_change ?? null, unit)}
                      </Td>
                      <Td className="text-right">
                        {fmtNumber(convertFromKg(s?.daily_gain ?? null, unit), 2)}
                      </Td>
                      <Td className="text-right">
                        {fmtNumber(s?.days_since_last_weight ?? null)}
                      </Td>
                      <Td>
                        <Link
                          href={`/lots/${lot.id}`}
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
