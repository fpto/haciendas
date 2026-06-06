import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateSale } from "@/actions/sales";
import { SaleForm } from "@/components/entity-forms/SaleForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function EditSalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const saleId = Number(id);
  if (Number.isNaN(saleId)) notFound();
  const sale = await prisma.sale.findUnique({ where: { id: saleId } });
  if (!sale) notFound();

  return (
    <div>
      <Link
        href={`/sales/${sale.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> {sale.buyer || `Venta #${sale.id}`}
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Editar venta
      </h1>
      <SaleForm
        action={updateSale.bind(null, sale.id)}
        sale={sale}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
