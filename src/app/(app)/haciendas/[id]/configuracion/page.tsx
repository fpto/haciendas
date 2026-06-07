import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { updateHaciendaConfig } from "@/actions/haciendas";
import { HaciendaConfigForm } from "@/components/entity-forms/HaciendaConfigForm";
import { ArrowLeftIcon } from "@/components/icons";
import { normalizeWeightMode } from "@/lib/weightMode";

export const dynamic = "force-dynamic";

export default async function HaciendaConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireEditor();
  const { id } = await params;
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
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-slate-900">
        Configuración
      </h1>
      <p className="mb-5 text-sm text-slate-500">{hacienda.name}</p>
      <div className="max-w-2xl">
        <HaciendaConfigForm
          action={updateHaciendaConfig.bind(null, hacienda.id)}
          haciendaId={hacienda.id}
          weightMode={normalizeWeightMode(hacienda.weightMode)}
        />
      </div>
    </div>
  );
}
