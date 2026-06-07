import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { createAnimal } from "@/actions/animals";
import { AnimalForm } from "@/components/entity-forms/AnimalForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function NewAnimalPage() {
  await requireEditor();
  const [lots, sales, haciendas] = await Promise.all([
    prisma.lot.findMany({ orderBy: [{ ranch: "asc" }, { number: "asc" }] }),
    prisma.sale.findMany({ orderBy: { date: "desc" } }),
    prisma.hacienda.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <Link
        href="/animals"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Animales
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Nuevo animal
      </h1>
      <AnimalForm
        action={createAnimal}
        lots={lots}
        sales={sales}
        haciendas={haciendas}
        submitLabel="Crear animal"
      />
    </div>
  );
}
