import Link from "next/link";
import { requireEditor } from "@/lib/auth";
import { createHacienda } from "@/actions/haciendas";
import { HaciendaForm } from "@/components/entity-forms/HaciendaForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function NewHaciendaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireEditor();
  const { error } = await searchParams;
  return (
    <div>
      <Link
        href="/haciendas"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Haciendas
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Nueva hacienda
      </h1>
      <HaciendaForm
        action={createHacienda}
        error={error}
        submitLabel="Crear hacienda"
      />
    </div>
  );
}
