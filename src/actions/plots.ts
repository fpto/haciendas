"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireEditor, requireAdmin } from "@/lib/auth";
import { str, float } from "@/actions/helpers";

function plotData(formData: FormData) {
  return {
    number: str(formData.get("number")),
    area: float(formData.get("area")),
    ranch: str(formData.get("ranch")),
    plotType: str(formData.get("plot_type")),
    comment: str(formData.get("comment")),
    boundaries: str(formData.get("boundaries")),
  };
}

export async function createPlot(formData: FormData) {
  await requireEditor();
  const plot = await prisma.plot.create({ data: plotData(formData) });
  revalidatePath("/plots");
  redirect(`/plots/${plot.id}?notice=Potrero creado correctamente`);
}

export async function updatePlot(id: number, formData: FormData) {
  await requireEditor();
  await prisma.plot.update({ where: { id }, data: plotData(formData) });
  revalidatePath("/plots");
  revalidatePath(`/plots/${id}`);
  redirect(`/plots/${id}?notice=Potrero actualizado correctamente`);
}

export async function deletePlot(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await prisma.plot.delete({ where: { id } });
  revalidatePath("/plots");
  redirect("/plots?notice=Potrero eliminado");
}
