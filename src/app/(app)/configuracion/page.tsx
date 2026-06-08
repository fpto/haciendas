import { requireEditor } from "@/lib/auth";
import { updateWeightMode } from "@/actions/settings";
import { getWeightMode } from "@/lib/settings";
import { HaciendaConfigForm } from "@/components/entity-forms/HaciendaConfigForm";
import { HACIENDA_NAME } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  await requireEditor();
  const weightMode = await getWeightMode();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-slate-900">
        Configuración
      </h1>
      <p className="mb-5 text-sm text-slate-500">{HACIENDA_NAME}</p>
      <div className="max-w-2xl">
        <HaciendaConfigForm action={updateWeightMode} weightMode={weightMode} />
      </div>
    </div>
  );
}
