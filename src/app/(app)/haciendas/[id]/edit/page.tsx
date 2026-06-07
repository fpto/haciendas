import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { updateHacienda } from "@/actions/haciendas";
import { HaciendaForm } from "@/components/entity-forms/HaciendaForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function EditHaciendaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireEditor();
  const { id } = await params;
  const { error } = await searchParams;
  const haciendaId = Number(id);
  if (Number.isNaN(haciendaId)) notFound();
  const hacienda = await prisma.hacienda.findUnique({
    where: { id: haciendaId },
  });
  if (!hacienda) notFound();

  return (
    <div>
      <Link
        href={`/haciendas/${hacienda.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> {hacienda.name}
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Editar hacienda
      </h1>
      <HaciendaForm
        action={updateHacienda.bind(null, hacienda.id)}
        hacienda={hacienda}
        error={error}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
