import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSaleStats } from "@/lib/queries";
import { PageHeader, EmptyState, TableWrap, Th, Td, Card, Badge } from "@/components/ui";
import { MoneyIcon, ChevronRightIcon } from "@/components/icons";
import { fmtNumber, fmtDate, fmtMoney, fmtPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

function roiColor(roi: number | null): "green" | "red" | "slate" {
  if (roi === null) return "slate";
  return roi >= 0 ? "green" : "red";
}

export default async function SalesPage() {
  const [sales, stats] = await Promise.all([
    prisma.sale.findMany({
      orderBy: { date: "desc" },
      include: { _count: { select: { animals: true } } },
    }),
    getSaleStats(),
  ]);
  const statBySale = new Map(stats.map((s) => [s.sale_id, s]));

  return (
    <div>
      <PageHeader
        title="Ventas"
        subtitle={`${fmtNumber(sales.length)} ventas registradas`}
        action={{ href: "/sales/new", label: "Nueva venta" }}
      />

      {sales.length === 0 ? (
        <EmptyState
          icon={<MoneyIcon width={26} height={26} />}
          title="Sin ventas"
          description="Registra una venta y asígnale animales para calcular utilidad y ROI."
          action={{ href: "/sales/new", label: "Nueva venta" }}
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
                        {fmtNumber(s?.sum_weight ?? null, 0)} kg
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
