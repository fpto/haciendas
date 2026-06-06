import Link from "next/link";
import { requireEditor } from "@/lib/auth";
import { createSale } from "@/actions/sales";
import { SaleForm } from "@/components/entity-forms/SaleForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function NewSalePage() {
  await requireEditor();
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
