import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader, EmptyState, TableWrap, Th, Td, Card } from "@/components/ui";
import { LotsIcon, ChevronRightIcon } from "@/components/icons";
import { fmtNumber, fmtDate } from "@/lib/utils";
import { getWeightUnit, fmtWeight } from "@/lib/units";
import { getActiveHacienda } from "@/lib/activeHacienda";
import { getCurrentUser, isEditor } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LotsPage() {
  const activeHacienda = await getActiveHacienda();
  const [lots, unit, user] = await Promise.all([
    prisma.lot.findMany({
      where: activeHacienda ? { ranch: activeHacienda } : undefined,
      orderBy: [{ ranch: "asc" }, { species: "asc" }, { number: "asc" }],
      include: {
        _count: { select: { animals: true } },
        plot: { select: { id: true, number: true } },
        // Último pesado del lote: define el peso promedio y el número de cabezas.
        weighings: { orderBy: [{ date: "desc" }, { id: "desc" }], take: 1 },
      },
    }),
    getWeightUnit(),
    getCurrentUser(),
  ]);
  const canEdit = isEditor(user?.role);

  return (
    <div>
      <PageHeader
        title="Lotes"
        subtitle={`${fmtNumber(lots.length)} lotes registrados${
          activeHacienda ? ` · ${activeHacienda}` : ""
        }`}
        action={canEdit ? { href: "/lots/new", label: "Nuevo lote" } : undefined}
      />

      {lots.length === 0 ? (
        <EmptyState
          icon={<LotsIcon width={26} height={26} />}
          title="Sin lotes"
          description="Crea tu primer lote para agrupar y dar seguimiento a tus animales."
          action={canEdit ? { href: "/lots/new", label: "Nuevo lote" } : undefined}
        />
      ) : (
        <>
          {/* Tarjetas móvil */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
            {lots.map((lot) => {
              const latest = lot.weighings[0] ?? null;
              return (
                <Link key={lot.id} href={`/lots/${lot.id}`}>
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">
                        {lot.name || `Lote ${lot.number}`}
                      </p>
                      <span className="text-xs text-slate-400">
                        {latest?.animalCount ?? lot._count.animals} cabezas
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {[
                        lot.ranch,
                        lot.species,
                        lot.plot?.number ? `Potrero ${lot.plot.number}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-center text-sm">
                      <div className="rounded-lg bg-slate-50 py-1.5">
                        <p className="text-xs text-slate-400">Peso prom.</p>
                        <p className="font-semibold">
                          {fmtWeight(latest?.averageWeight ?? null, unit)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 py-1.5">
                        <p className="text-xs text-slate-400">Último pesado</p>
                        <p className="font-semibold">{fmtDate(latest?.date)}</p>
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
                  <Th>Potrero</Th>
                  <Th>Especie</Th>
                  <Th className="text-right">Cabezas</Th>
                  <Th className="text-right">Peso promedio</Th>
                  <Th className="text-right">Último pesado</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => {
                  const latest = lot.weighings[0] ?? null;
                  return (
                    <tr key={lot.id} className="hover:bg-slate-50">
                      <Td className="font-semibold text-slate-900">
                        {lot.name || lot.number || `#${lot.id}`}
                      </Td>
                      <Td>{lot.ranch ?? "—"}</Td>
                      <Td>
                        {lot.plot?.number ? `Potrero ${lot.plot.number}` : "—"}
                      </Td>
                      <Td className="capitalize">{lot.species ?? "—"}</Td>
                      <Td className="text-right">
                        {latest?.animalCount ?? lot._count.animals}
                      </Td>
                      <Td className="text-right">
                        {fmtWeight(latest?.averageWeight ?? null, unit)}
                      </Td>
                      <Td className="text-right">{fmtDate(latest?.date)}</Td>
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
