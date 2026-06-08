"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { str } from "@/actions/helpers";
import { normalizeWeightMode } from "@/lib/weightMode";
import { getHaciendaSettings } from "@/lib/settings";

// Guarda la configuración de la hacienda (modo de medición de peso). Opera sobre
// el único registro de configuración, creándolo si hiciera falta.
export async function updateWeightMode(formData: FormData) {
  await requireEditor();
  const weightMode = normalizeWeightMode(str(formData.get("weightMode")));
  const settings = await getHaciendaSettings();
  await prisma.hacienda.update({
    where: { id: settings.id },
    data: { weightMode },
  });
  revalidatePath("/configuracion");
  revalidatePath("/");
  redirect("/configuracion?notice=Configuración guardada correctamente");
}
