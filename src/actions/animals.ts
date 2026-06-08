"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireEditor, requireAdmin } from "@/lib/auth";
import { str, int, float, date } from "@/actions/helpers";

function animalData(formData: FormData) {
  return {
    animalNumber: int(formData.get("animal_number")),
    birthday: date(formData.get("birthday")),
    ranch: str(formData.get("ranch")),
    lotId: int(formData.get("lot_id")),
    status: str(formData.get("status")),
    breed: str(formData.get("breed")),
    provider: str(formData.get("provider")),
    mark: str(formData.get("mark")),
    color: str(formData.get("color")),
    purchasePrice: float(formData.get("purchase_price")),
    saleId: int(formData.get("sale_id")),
    salePrice: float(formData.get("sale_price")),
  };
}

export async function createAnimal(formData: FormData) {
  await requireEditor();
  const animal = await prisma.animal.create({ data: animalData(formData) });
  revalidatePath("/animals");
  redirect(`/animals/${animal.id}?notice=Animal creado correctamente`);
}

export async function updateAnimal(id: number, formData: FormData) {
  await requireEditor();
  await prisma.animal.update({ where: { id }, data: animalData(formData) });
  revalidatePath("/animals");
  revalidatePath(`/animals/${id}`);
  redirect(`/animals/${id}?notice=Animal actualizado correctamente`);
}

export async function deleteAnimal(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await prisma.animal.delete({ where: { id } });
  revalidatePath("/animals");
  redirect("/animals?notice=Animal eliminado");
}
