import Link from "next/link";
import { Card } from "@/components/ui";
import { SubmitButton } from "@/components/forms";
import { ScaleIcon } from "@/components/icons";
import {
  WEIGHT_MODES,
  normalizeWeightMode,
  type WeightMode,
} from "@/lib/weightMode";

export function HaciendaConfigForm({
  action,
  haciendaId,
  weightMode,
}: {
  action: (formData: FormData) => void | Promise<void>;
  haciendaId: number;
  weightMode: WeightMode;
}) {
  const current = normalizeWeightMode(weightMode);

  return (
    <form action={action}>
      <Card className="space-y-5 p-5 sm:p-6">
        <div>
          <div className="flex items-center gap-2 text-slate-800">
            <ScaleIcon width={18} height={18} />
            <h2 className="text-sm font-semibold">Modo de medición de peso</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Define cómo se registran las pesadas del ganado en esta hacienda.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {WEIGHT_MODES.map((mode) => (
            <label
              key={mode.value}
              className="relative flex cursor-pointer gap-3 rounded-xl border border-slate-300 bg-white p-4 shadow-sm transition has-[:checked]:border-brand-500 has-[:checked]:ring-2 has-[:checked]:ring-brand-500/20 hover:bg-slate-50"
            >
              <input
                type="radio"
                name="weightMode"
                value={mode.value}
                defaultChecked={current === mode.value}
                className="peer sr-only"
              />
              <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-slate-300 transition peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:shadow-[inset_0_0_0_3px_white]" />
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">
                  {mode.label}
                </span>
                <span className="mt-1 text-xs leading-relaxed text-slate-500">
                  {mode.description}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <SubmitButton>Guardar configuración</SubmitButton>
          <Link
            href={`/haciendas/${haciendaId}`}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </Link>
        </div>
      </Card>
    </form>
  );
}
