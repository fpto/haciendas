"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireEditor, requireAdmin } from "@/lib/auth";
import { str, int, float, date } from "@/actions/helpers";

function weightData(formData: FormData) {
  return {
    animalId: int(formData.get("animal_id")),
    date: date(formData.get("date")),
    weight: float(formData.get("weight")),
    note: str(formData.get("note")),
  };
}

export async function createWeight(formData: FormData) {
  await requireEditor();
  const weight = await prisma.weight.create({ data: weightData(formData) });
  revalidatePath("/weights");
  if (weight.animalId) revalidatePath(`/animals/${weight.animalId}`);
  redirect(
    weight.animalId
      ? `/animals/${weight.animalId}?notice=Peso registrado correctamente`
      : `/weights?notice=Peso registrado correctamente`,
  );
}

export async function updateWeight(id: number, formData: FormData) {
  await requireEditor();
  const weight = await prisma.weight.update({
    where: { id },
    data: weightData(formData),
  });
  revalidatePath("/weights");
  if (weight.animalId) revalidatePath(`/animals/${weight.animalId}`);
  redirect(
    weight.animalId
      ? `/animals/${weight.animalId}?notice=Peso actualizado correctamente`
      : `/weights?notice=Peso actualizado correctamente`,
  );
}

export async function deleteWeight(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const weight = await prisma.weight.delete({ where: { id } });
  revalidatePath("/weights");
  if (weight.animalId) revalidatePath(`/animals/${weight.animalId}`);
  redirect("/weights?notice=Peso eliminado");
}
