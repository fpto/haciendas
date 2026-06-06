"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireEditor, requireAdmin } from "@/lib/auth";
import { str, date } from "@/actions/helpers";

function saleData(formData: FormData) {
  return {
    date: date(formData.get("date")),
    buyer: str(formData.get("buyer")),
    comment: str(formData.get("comment")),
  };
}

export async function createSale(formData: FormData) {
  await requireEditor();
  const sale = await prisma.sale.create({ data: saleData(formData) });
  revalidatePath("/sales");
  redirect(`/sales/${sale.id}?notice=Venta creada correctamente`);
}

export async function updateSale(id: number, formData: FormData) {
  await requireEditor();
  await prisma.sale.update({ where: { id }, data: saleData(formData) });
  revalidatePath("/sales");
  revalidatePath(`/sales/${id}`);
  redirect(`/sales/${id}?notice=Venta actualizada correctamente`);
}

export async function deleteSale(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await prisma.sale.delete({ where: { id } });
  revalidatePath("/sales");
  redirect("/sales?notice=Venta eliminada");
}
