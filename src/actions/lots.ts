"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireEditor, requireAdmin } from "@/lib/auth";
import { str, int, float, date } from "@/actions/helpers";
import { normalizeLotStatus } from "@/lib/lotStatus";

function lotData(formData: FormData) {
  const status = normalizeLotStatus(str(formData.get("status")));
  // Los datos de venta solo se guardan cuando el lote está vendido; al cambiar
  // a otro estado se limpian para no dejar información obsoleta.
  const sold = status === "sold";
  return {
    ranch: str(formData.get("ranch")),
    number: str(formData.get("number")),
    name: str(formData.get("name")),
    description: str(formData.get("description")),
    plotId: int(formData.get("plot_id")),
    corralId: int(formData.get("corral_id")),
    status,
    saleDate: sold ? date(formData.get("sale_date")) : null,
    buyer: sold ? str(formData.get("buyer")) : null,
    salePrice: sold ? float(formData.get("sale_price")) : null,
    saleComment: sold ? str(formData.get("sale_comment")) : null,
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

// Registra la venta de un lote desde la vista de Ventas (modo "Por Lote"):
// marca el lote como vendido y guarda los datos de la venta.
export async function sellLot(formData: FormData) {
  await requireEditor();
  const id = int(formData.get("lot_id"));
  if (id === null) {
    redirect("/sales/new?error=Selecciona un lote para vender");
  }
  await prisma.lot.update({
    where: { id },
    data: {
      status: "sold",
      saleDate: date(formData.get("sale_date")),
      buyer: str(formData.get("buyer")),
      salePrice: float(formData.get("sale_price")),
      saleComment: str(formData.get("sale_comment")),
    },
  });
  revalidatePath("/sales");
  revalidatePath("/lots");
  revalidatePath(`/lots/${id}`);
  redirect("/sales?notice=Venta del lote registrada correctamente");
}

export async function deleteLot(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await prisma.lot.delete({ where: { id } });
  revalidatePath("/lots");
  redirect("/lots?notice=Lote eliminado");
}
