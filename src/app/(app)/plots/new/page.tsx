import Link from "next/link";
import { requireEditor } from "@/lib/auth";
import { createPlot } from "@/actions/plots";
import { PlotForm } from "@/components/entity-forms/PlotForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function NewPlotPage() {
  await requireEditor();
  return (
    <div>
      <Link
        href="/plots"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Potreros
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Nuevo potrero
      </h1>
      <PlotForm action={createPlot} submitLabel="Crear potrero" />
    </div>
  );
}
