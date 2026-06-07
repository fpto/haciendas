"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireEditor, requireAdmin } from "@/lib/auth";
import { str, int } from "@/actions/helpers";

function lotData(formData: FormData) {
  return {
    ranch: str(formData.get("ranch")),
    species: str(formData.get("species")),
    number: str(formData.get("number")),
    name: str(formData.get("name")),
    description: str(formData.get("description")),
    plotId: int(formData.get("plot_id")),
  };
}

export async function createLot(formData: FormData) {
  await requireEditor();
  const lot = await prisma.lot.create({ data: lotData(formData) });
  revalidatePath("/lots");
  redirect(`/lots/${lot.id}?notice=Lote creado correctamente`);
}

export async function updateLot(id: number, formData: FormData) {
  await requireEditor();
  await prisma.lot.update({ where: { id }, data: lotData(formData) });
  revalidatePath("/lots");
  revalidatePath(`/lots/${id}`);
  redirect(`/lots/${id}?notice=Lote actualizado correctamente`);
}

export async function deleteLot(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await prisma.lot.delete({ where: { id } });
  revalidatePath("/lots");
  redirect("/lots?notice=Lote eliminado");
}
