import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { createLot } from "@/actions/lots";
import { LotForm } from "@/components/entity-forms/LotForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function NewLotPage() {
  await requireEditor();
  const haciendas = await prisma.hacienda.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return (
    <div>
      <Link
        href="/lots"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Lotes
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Nuevo lote
      </h1>
      <LotForm action={createLot} haciendas={haciendas} submitLabel="Crear lote" />
    </div>
  );
}
