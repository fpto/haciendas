import Link from "next/link";
import { requireEditor } from "@/lib/auth";
import { createCorral } from "@/actions/corrals";
import { CorralForm } from "@/components/entity-forms/CorralForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function NewCorralPage() {
  await requireEditor();
  return (
    <div>
      <Link
        href="/corrals"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Corrales
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Nuevo corral
      </h1>
      <CorralForm action={createCorral} submitLabel="Crear corral" />
    </div>
  );
}
