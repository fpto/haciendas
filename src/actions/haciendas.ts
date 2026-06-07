"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireEditor, requireAdmin } from "@/lib/auth";
import { str } from "@/actions/helpers";
import { normalizeWeightMode } from "@/lib/weightMode";

function haciendaData(formData: FormData) {
  return {
    name: str(formData.get("name")) ?? "",
    location: str(formData.get("location")),
    notes: str(formData.get("notes")),
  };
}

export async function createHacienda(formData: FormData) {
  await requireEditor();
  const data = haciendaData(formData);
  if (!data.name) {
    redirect("/haciendas/new?error=El nombre de la hacienda es obligatorio");
  }
  const existing = await prisma.hacienda.findUnique({
    where: { name: data.name },
  });
  if (existing) {
    redirect("/haciendas/new?error=Ya existe una hacienda con ese nombre");
  }
  const hacienda = await prisma.hacienda.create({ data });
  revalidatePath("/haciendas");
  redirect(`/haciendas/${hacienda.id}?notice=Hacienda creada correctamente`);
}

export async function updateHacienda(id: number, formData: FormData) {
  await requireEditor();
  const data = haciendaData(formData);
  if (!data.name) {
    redirect(`/haciendas/${id}/edit?error=El nombre es obligatorio`);
  }
  await prisma.hacienda.update({ where: { id }, data });
  revalidatePath("/haciendas");
  revalidatePath(`/haciendas/${id}`);
  redirect(`/haciendas/${id}?notice=Hacienda actualizada correctamente`);
}

export async function updateHaciendaConfig(id: number, formData: FormData) {
  await requireEditor();
  const weightMode = normalizeWeightMode(str(formData.get("weightMode")));
  await prisma.hacienda.update({ where: { id }, data: { weightMode } });
  revalidatePath(`/haciendas/${id}`);
  revalidatePath(`/haciendas/${id}/configuracion`);
  redirect(
    `/haciendas/${id}/configuracion?notice=Configuración guardada correctamente`,
  );
}

export async function deleteHacienda(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await prisma.hacienda.delete({ where: { id } });
  revalidatePath("/haciendas");
  redirect("/haciendas?notice=Hacienda eliminada");
}
