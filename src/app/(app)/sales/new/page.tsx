import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { createSale } from "@/actions/sales";
import { sellLot } from "@/actions/lots";
import { SaleForm } from "@/components/entity-forms/SaleForm";
import { LotSaleForm } from "@/components/entity-forms/LotSaleForm";
import { ArrowLeftIcon } from "@/components/icons";
import { getActiveHacienda } from "@/lib/activeHacienda";
import { getActiveWeightMode } from "@/lib/activeWeightMode";

export const dynamic = "force-dynamic";

export default async function NewSalePage({
  searchParams,
}: {
  searchParams: Promise<{ lot_id?: string }>;
}) {
  await requireEditor();
  const [mode, activeHacienda, sp] = await Promise.all([
    getActiveWeightMode(),
    getActiveHacienda(),
    searchParams,
  ]);

  // En modo "Por Lote" la venta se hace eligiendo un lote en crecimiento; en
  // modo "Por Animal" se mantiene el registro de venta basado en animales.
  if (mode === "lot") {
    const lots = await prisma.lot.findMany({
      where: {
        status: "growing",
        ...(activeHacienda ? { ranch: activeHacienda } : {}),
      },
      orderBy: [{ ranch: "asc" }, { number: "asc" }],
      select: { id: true, number: true, name: true, ranch: true },
    });
    const lotOptions = lots.map((l) => ({
      id: l.id,
      label:
        [l.name || (l.number ? `Lote ${l.number}` : `#${l.id}`), l.ranch]
          .filter(Boolean)
          .join(" · "),
    }));
    const defaultLotId = sp.lot_id ? Number(sp.lot_id) : undefined;

    return (
      <div>
        <Link
          href="/sales"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeftIcon width={16} height={16} /> Ventas
        </Link>
        <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
          Vender lote
        </h1>
        <LotSaleForm
          action={sellLot}
          lots={lotOptions}
          defaultLotId={
            defaultLotId && lotOptions.some((l) => l.id === defaultLotId)
              ? defaultLotId
              : undefined
          }
          submitLabel="Registrar venta"
        />
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/sales"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Ventas
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Nueva venta
      </h1>
      <SaleForm action={createSale} submitLabel="Crear venta" />
    </div>
  );
}
