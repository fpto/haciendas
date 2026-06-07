"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireEditor, requireAdmin } from "@/lib/auth";
import { str, int, float, date } from "@/actions/helpers";
import { getWeightUnit, convertToKg } from "@/lib/units";

async function weighingData(formData: FormData) {
  const unit = await getWeightUnit();
  // El peso promedio se captura en la unidad preferida; se almacena en kg.
  const entered = float(formData.get("average_weight"));
  return {
    lotId: int(formData.get("lot_id")),
    date: date(formData.get("date")),
    averageWeight: convertToKg(entered, unit),
    animalCount: int(formData.get("animal_count")),
    note: str(formData.get("note")),
  };
}

export async function createLotWeighing(formData: FormData) {
  await requireEditor();
  const weighing = await prisma.lotWeighing.create({
    data: await weighingData(formData),
  });
  revalidatePath("/lots");
  if (weighing.lotId) revalidatePath(`/lots/${weighing.lotId}`);
  redirect(
    weighing.lotId
      ? `/lots/${weighing.lotId}?notice=Pesado registrado correctamente`
      : `/lots?notice=Pesado registrado correctamente`,
  );
}

export async function updateLotWeighing(id: number, formData: FormData) {
  await requireEditor();
  const weighing = await prisma.lotWeighing.update({
    where: { id },
    data: await weighingData(formData),
  });
  revalidatePath("/lots");
  if (weighing.lotId) revalidatePath(`/lots/${weighing.lotId}`);
  redirect(
    weighing.lotId
      ? `/lots/${weighing.lotId}?notice=Pesado actualizado correctamente`
      : `/lots?notice=Pesado actualizado correctamente`,
  );
}

export async function deleteLotWeighing(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const weighing = await prisma.lotWeighing.delete({ where: { id } });
  revalidatePath("/lots");
  if (weighing.lotId) revalidatePath(`/lots/${weighing.lotId}`);
  redirect(
    weighing.lotId
      ? `/lots/${weighing.lotId}?notice=Pesado eliminado`
      : `/lots?notice=Pesado eliminado`,
  );
}
