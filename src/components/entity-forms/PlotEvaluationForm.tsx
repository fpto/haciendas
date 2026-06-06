import Link from "next/link";
import type { PlotEvaluation, Plot } from "@prisma/client";
import { Card } from "@/components/ui";
import { Field, Input, Select, Textarea, SubmitButton } from "@/components/forms";
import { toDateInput } from "@/lib/utils";

const SCORES = [1, 2, 3, 4, 5];

export function PlotEvaluationForm({
  action,
  evaluation,
  plots,
  defaultPlotId,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  evaluation?: PlotEvaluation | null;
  plots: Pick<Plot, "id" | "number" | "ranch" | "plotType">[];
  defaultPlotId?: number;
  submitLabel: string;
}) {
  const selectedPlot = evaluation?.plotId ?? defaultPlotId ?? "";
  return (
    <form action={action}>
      <Card className="space-y-5 p-5 sm:p-6">
        <Field label="Potrero">
          <Select name="plot_id" defaultValue={selectedPlot} required>
            <option value="">— Selecciona un potrero —</option>
            {plots.map((p) => (
              <option key={p.id} value={p.id}>
                {[p.ranch, p.plotType, p.number].filter(Boolean).join(" · ")}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Fecha">
          <Input
            type="date"
            name="date"
            defaultValue={toDateInput(evaluation?.date)}
            required
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Agua (1-5)">
            <Select name="water_score" defaultValue={evaluation?.waterScore ?? 3}>
              {SCORES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Pasto (1-5)">
            <Select
              name="pasture_score"
              defaultValue={evaluation?.pastureScore ?? 3}
            >
              {SCORES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Cercas (1-5)">
            <Select
              name="fences_score"
              defaultValue={evaluation?.fencesScore ?? 3}
            >
              {SCORES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Comentario">
          <Textarea name="comment" defaultValue={evaluation?.comment ?? ""} />
        </Field>
        <div className="flex items-center gap-3 pt-1">
          <SubmitButton>{submitLabel}</SubmitButton>
          <Link
            href={
              evaluation?.plotId
                ? `/plots/${evaluation.plotId}`
                : "/plot_evaluations"
            }
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </Link>
        </div>
      </Card>
    </form>
  );
}
