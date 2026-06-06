"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireEditor, requireAdmin } from "@/lib/auth";
import { str, int, date } from "@/actions/helpers";

function evalData(formData: FormData) {
  return {
    plotId: int(formData.get("plot_id")),
    date: date(formData.get("date")),
    waterScore: int(formData.get("water_score")),
    pastureScore: int(formData.get("pasture_score")),
    fencesScore: int(formData.get("fences_score")),
    comment: str(formData.get("comment")),
  };
}

export async function createPlotEvaluation(formData: FormData) {
  await requireEditor();
  const ev = await prisma.plotEvaluation.create({ data: evalData(formData) });
  revalidatePath("/plot_evaluations");
  if (ev.plotId) revalidatePath(`/plots/${ev.plotId}`);
  redirect(`/plot_evaluations/${ev.id}?notice=Evaluación creada correctamente`);
}

export async function updatePlotEvaluation(id: number, formData: FormData) {
  await requireEditor();
  const ev = await prisma.plotEvaluation.update({
    where: { id },
    data: evalData(formData),
  });
  revalidatePath("/plot_evaluations");
  revalidatePath(`/plot_evaluations/${id}`);
  if (ev.plotId) revalidatePath(`/plots/${ev.plotId}`);
  redirect(`/plot_evaluations/${id}?notice=Evaluación actualizada correctamente`);
}

export async function deletePlotEvaluation(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await prisma.plotEvaluation.delete({ where: { id } });
  revalidatePath("/plot_evaluations");
  redirect("/plot_evaluations?notice=Evaluación eliminada");
}
