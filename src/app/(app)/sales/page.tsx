import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSaleStats } from "@/lib/queries";
import { PageHeader, EmptyState, TableWrap, Th, Td, Card, Badge } from "@/components/ui";
import { MoneyIcon, ChevronRightIcon } from "@/components/icons";
import { fmtNumber, fmtDate, fmtMoney, fmtPercent } from "@/lib/utils";
import { getWeightUnit, fmtWeight } from "@/lib/units";
import { getActiveHacienda } from "@/lib/activeHacienda";
import { getActiveWeightMode } from "@/lib/activeWeightMode";
import { getCurrentUser, isEditor } from "@/lib/auth";

export const dynamic = "force-dynamic";

function roiColor(roi: number | null): "green" | "red" | "slate" {
  if (roi === null) return "slate";
  return roi >= 0 ? "green" : "red";
}

export default async function SalesPage() {
  // En modo "Por Lote" las ventas se gestionan por lote (estado "vendido"), no
  // por animales individuales.
  const mode = await getActiveWeightMode();
  if (mode === "lot") return <LotSalesPage />;
  return <AnimalSalesPage />;
}

// ---------------------------------------------------------------------------
// Ventas por lote (modo "Por Lote"): lista de lotes vendidos. El detalle de
// cada venta vive en la ficha del lote.
// ---------------------------------------------------------------------------
async function LotSalesPage() {
  const activeHacienda = await getActiveHacienda();
  const [lots, unit, user] = await Promise.all([
    prisma.lot.findMany({
      where: {
        status: "sold",
        ...(activeHacienda ? { ranch: activeHacienda } : {}),
      },
      orderBy: [{ saleDate: "desc" }, { id: "desc" }],
      include: {
        weighings: {
          orderBy: [{ date: "desc" }, { id: "desc" }],
          take: 1,
          select: { averageWeight: true, animalCount: true },
        },
      },
    }),
    getWeightUnit(),
    getCurrentUser(),
  ]);
  const canEdit = isEditor(user?.role);

  // Peso total y total de la venta de cada lote, calculados con el último pesado.
  const rows = lots.map((lot) => {
    const latest = lot.weighings[0] ?? null;
    const weightKg =
      latest?.averageWeight != null && latest?.animalCount != null
        ? latest.averageWeight * latest.animalCount
        : null;
    const total =
      lot.salePrice != null && weightKg != null ? lot.salePrice * weightKg : null;
    return { lot, headcount: latest?.animalCount ?? null, weightKg, total };
  });

  return (
    <div>
      <PageHeader
        title="Ventas"
        subtitle={`${fmtNumber(lots.length)} lotes vendidos${
          activeHacienda ? ` · ${activeHacienda}` : ""
        }`}
        action={canEdit ? { href: "/sales/new", label: "Vender lote" } : undefined}
      />

      {lots.length === 0 ? (
        <EmptyState
          icon={<MoneyIcon width={26} height={26} />}
          title="Sin ventas"
          description="Registra una venta eligiendo un lote en crecimiento y sus datos de venta."
          action={canEdit ? { href: "/sales/new", label: "Vender lote" } : undefined}
        />
      ) : (
        <>
          {/* Tarjetas móvil */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
            {rows.map(({ lot, headcount, total }) => (
              <Link key={lot.id} href={`/lots/${lot.id}`}>
                <Card className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-slate-900">
                      {lot.name || `Lote ${lot.number}`}
                    </p>
                    <Badge color="blue">{fmtDate(lot.saleDate)}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {[lot.buyer, headcount != null ? `${headcount} cabezas` : null]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-center text-sm">
                    <div className="rounded-lg bg-slate-50 py-1.5">
                      <p className="text-xs text-slate-400">Precio/lb</p>
                      <p className="font-semibold">
                        {lot.salePrice != null ? fmtMoney(lot.salePrice) : "—"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 py-1.5">
                      <p className="text-xs text-slate-400">Total venta</p>
                      <p className="font-semibold">{fmtMoney(total)}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Tabla escritorio */}
          <div className="hidden lg:block">
            <TableWrap>
              <thead>
                <tr>
                  <Th>Lote</Th>
                  <Th>Fecha de venta</Th>
                  <Th>Comprador</Th>
                  <Th className="text-right">Cabezas</Th>
                  <Th className="text-right">Peso total</Th>
                  <Th className="text-right">Precio/lb</Th>
                  <Th className="text-right">Total venta</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ lot, headcount, weightKg, total }) => (
                  <tr key={lot.id} className="hover:bg-slate-50">
                    <Td className="font-semibold text-slate-900">
                      {lot.name || lot.number || `#${lot.id}`}
                    </Td>
                    <Td>{fmtDate(lot.saleDate)}</Td>
                    <Td>{lot.buyer ?? "—"}</Td>
                    <Td className="text-right">{headcount ?? "—"}</Td>
                    <Td className="text-right">{fmtWeight(weightKg, unit, 0)}</Td>
                    <Td className="text-right">
                      {lot.salePrice != null ? fmtMoney(lot.salePrice) : "—"}
                    </Td>
                    <Td className="text-right font-semibold">{fmtMoney(total)}</Td>
                    <Td>
                      <Link
                        href={`/lots/${lot.id}`}
                        className="inline-flex text-brand-600"
                      >
                        <ChevronRightIcon />
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ventas por animal (modo "Por Animal"): registros de venta con ROI.
// ---------------------------------------------------------------------------
async function AnimalSalesPage() {
  const activeHacienda = await getActiveHacienda();
  const [sales, stats, user] = await Promise.all([
    prisma.sale.findMany({
      where: activeHacienda
        ? { animals: { some: { ranch: activeHacienda } } }
        : undefined,
      orderBy: { date: "desc" },
      include: { _count: { select: { animals: true } } },
    }),
    getSaleStats(activeHacienda ?? undefined),
    getCurrentUser(),
  ]);
  const canEdit = isEditor(user?.role);
  const unit = await getWeightUnit();
  const statBySale = new Map(stats.map((s) => [s.sale_id, s]));

  return (
    <div>
      <PageHeader
        title="Ventas"
        subtitle={`${fmtNumber(sales.length)} ventas registradas${
          activeHacienda ? ` · ${activeHacienda}` : ""
        }`}
        action={canEdit ? { href: "/sales/new", label: "Nueva venta" } : undefined}
      />

      {sales.length === 0 ? (
        <EmptyState
          icon={<MoneyIcon width={26} height={26} />}
          title="Sin ventas"
          description="Registra una venta y asígnale animales para calcular utilidad y ROI."
          action={canEdit ? { href: "/sales/new", label: "Nueva venta" } : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
            {sales.map((sale) => {
              const s = statBySale.get(sale.id);
              return (
                <Link key={sale.id} href={`/sales/${sale.id}`}>
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">
                        {sale.buyer || `Venta #${sale.id}`}
                      </p>
                      <Badge color={roiColor(s?.roi ?? null)}>
                        ROI {fmtPercent(s?.roi ?? null)}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {fmtDate(sale.date)} · {sale._count.animals} animales
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-center text-sm">
                      <div className="rounded-lg bg-slate-50 py-1.5">
                        <p className="text-xs text-slate-400">Total venta</p>
                        <p className="font-semibold">
                          {fmtMoney(s?.sale_total ?? null)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 py-1.5">
                        <p className="text-xs text-slate-400">Utilidad</p>
                        <p className="font-semibold">
                          {fmtMoney(s?.profit ?? null)}
                        </p>
                      </div>
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
                  <Th>Fecha</Th>
                  <Th>Comprador</Th>
                  <Th className="text-right">Animales</Th>
                  <Th className="text-right">Peso total</Th>
                  <Th className="text-right">Total venta</Th>
                  <Th className="text-right">Costo</Th>
                  <Th className="text-right">Utilidad</Th>
                  <Th className="text-right">ROI</Th>
                  <Th className="text-right">ROI anual</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => {
                  const s = statBySale.get(sale.id);
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50">
                      <Td>{fmtDate(sale.date)}</Td>
                      <Td className="font-semibold text-slate-900">
                        {sale.buyer ?? "—"}
                      </Td>
                      <Td className="text-right">{sale._count.animals}</Td>
                      <Td className="text-right">
                        {fmtWeight(s?.sum_weight ?? null, unit, 0)}
                      </Td>
                      <Td className="text-right">
                        {fmtMoney(s?.sale_total ?? null)}
                      </Td>
                      <Td className="text-right text-slate-500">
                        {fmtMoney(s?.sale_cost ?? null)}
                      </Td>
                      <Td className="text-right font-semibold">
                        {fmtMoney(s?.profit ?? null)}
                      </Td>
                      <Td className="text-right">
                        <Badge color={roiColor(s?.roi ?? null)}>
                          {fmtPercent(s?.roi ?? null)}
                        </Badge>
                      </Td>
                      <Td className="text-right">
                        {fmtPercent(s?.roia ?? null)}
                      </Td>
                      <Td>
                        <Link
                          href={`/sales/${sale.id}`}
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
