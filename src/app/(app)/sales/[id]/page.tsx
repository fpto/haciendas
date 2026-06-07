import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSaleStats } from "@/lib/queries";
import { getCurrentUser, isAdmin, isEditor } from "@/lib/auth";
import { deleteSale } from "@/actions/sales";
import { Card, DescList, TableWrap, Th, Td, EmptyState, Badge, StatCard } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { ArrowLeftIcon, EditIcon, ChevronRightIcon, CowIcon } from "@/components/icons";
import { fmtNumber, fmtDate, fmtMoney, fmtPercent } from "@/lib/utils";
import { getWeightUnit, fmtWeight, convertFromKg } from "@/lib/units";

export const dynamic = "force-dynamic";

export default async function SaleShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const saleId = Number(id);
  if (Number.isNaN(saleId)) notFound();

  const [sale, stats, user] = await Promise.all([
    prisma.sale.findUnique({
      where: { id: saleId },
      include: { animals: { orderBy: { animalNumber: "asc" } } },
    }),
    getSaleStats(),
    getCurrentUser(),
  ]);
  if (!sale) notFound();

  const unit = await getWeightUnit();
  const s = stats.find((x) => x.sale_id === sale.id);
  const canEdit = isEditor(user?.role);
  const canDelete = isAdmin(user?.role);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/sales"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeftIcon width={16} height={16} /> Ventas
        </Link>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/sales/${sale.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <EditIcon width={16} height={16} /> Editar
            </Link>
          )}
          {canDelete && <DeleteButton action={deleteSale} id={sale.id} />}
        </div>
      </div>

      <h1 className="mb-1 text-2xl font-bold tracking-tight text-slate-900">
        {sale.buyer || `Venta #${sale.id}`}
      </h1>
      <p className="mb-6 text-sm text-slate-500">{fmtDate(sale.date)}</p>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Total venta"
          value={fmtMoney(s?.sale_total ?? null)}
          accent="brand"
        />
        <StatCard
          label="Utilidad"
          value={fmtMoney(s?.profit ?? null)}
          accent="blue"
        />
        <StatCard label="ROI" value={fmtPercent(s?.roi ?? null)} accent="violet" />
        <StatCard
          label="ROI anualizado"
          value={fmtPercent(s?.roia ?? null)}
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <DescList
            items={[
              { label: "Comprador", value: sale.buyer ?? "—" },
              { label: "Fecha", value: fmtDate(sale.date) },
              { label: "Animales", value: <Badge color="green">{sale.animals.length}</Badge> },
              { label: "Peso total", value: fmtWeight(s?.sum_weight ?? null, unit, 0) },
              { label: "Peso promedio", value: fmtWeight(s?.avg_weight ?? null, unit) },
              { label: "Costo total", value: fmtMoney(s?.sale_cost ?? null) },
              { label: "Días en hacienda", value: fmtNumber(s?.days_in_ranch ?? null) },
              { label: "GDP promedio", value: fmtNumber(convertFromKg(s?.daily_gain ?? null, unit), 2) },
              { label: "Comentario", value: sale.comment ?? "—" },
            ]}
          />
        </Card>

        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Animales vendidos
          </h2>
          {sale.animals.length === 0 ? (
            <EmptyState
              icon={<CowIcon width={24} height={24} />}
              title="Sin animales asignados"
              description="Asigna animales a esta venta desde la ficha de cada animal."
            />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Especie</Th>
                  <Th>Hacienda</Th>
                  <Th className="text-right">Precio venta</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {sale.animals.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <Td className="font-semibold text-slate-900">
                      {a.animalNumber ?? a.id}
                    </Td>
                    <Td className="capitalize">{a.species ?? "—"}</Td>
                    <Td>{a.ranch ?? "—"}</Td>
                    <Td className="text-right">
                      {a.salePrice ? `${fmtMoney(a.salePrice)}/kg` : "—"}
                    </Td>
                    <Td>
                      <Link
                        href={`/animals/${a.id}`}
                        className="inline-flex text-brand-600"
                      >
                        <ChevronRightIcon />
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </div>
      </div>
    </div>
  );
}
