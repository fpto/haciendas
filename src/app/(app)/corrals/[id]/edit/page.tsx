import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateCorral } from "@/actions/corrals";
import { CorralForm } from "@/components/entity-forms/CorralForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function EditCorralPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const corralId = Number(id);
  if (Number.isNaN(corralId)) notFound();
  const corral = await prisma.corral.findUnique({ where: { id: corralId } });
  if (!corral) notFound();

  return (
    <div>
      <Link
        href={`/corrals/${corral.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Corral {corral.number}
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Editar corral
      </h1>
      <CorralForm
        action={updateCorral.bind(null, corral.id)}
        corral={corral}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
