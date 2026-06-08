"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireEditor, requireAdmin } from "@/lib/auth";
import { str, float } from "@/actions/helpers";
import { parseKmzOrKmlPoints } from "@/lib/kml";

function corralData(formData: FormData) {
  return {
    number: str(formData.get("number")),
    ranch: str(formData.get("ranch")),
    comment: str(formData.get("comment")),
    latitude: float(formData.get("latitude")),
    longitude: float(formData.get("longitude")),
  };
}

export async function createCorral(formData: FormData) {
  await requireEditor();
  const corral = await prisma.corral.create({ data: corralData(formData) });
  revalidatePath("/corrals");
  redirect(`/corrals/${corral.id}?notice=Corral creado correctamente`);
}

export async function updateCorral(id: number, formData: FormData) {
  await requireEditor();
  await prisma.corral.update({ where: { id }, data: corralData(formData) });
  revalidatePath("/corrals");
  revalidatePath(`/corrals/${id}`);
  redirect(`/corrals/${id}?notice=Corral actualizado correctamente`);
}

export async function deleteCorral(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await prisma.corral.delete({ where: { id } });
  revalidatePath("/corrals");
  redirect("/corrals?notice=Corral eliminado");
}

// Importa corrales desde un archivo .kmz/.kml de Google Earth.
// Cada punto (Placemark con Point) se convierte en un corral: su nombre se usa
// como número y sus coordenadas como latitud/longitud. Si ya existe un corral
// con ese número (y misma hacienda, si se indica) se actualiza; si no, se crea.
export async function importCorralsFromKmz(formData: FormData) {
  await requireEditor();

  const file = formData.get("file");
  const ranch = str(formData.get("ranch"));

  if (!file || typeof file === "string" || file.size === 0) {
    redirect("/corrals/import?error=Selecciona un archivo .kmz o .kml válido");
  }

  const bytes = new Uint8Array(await (file as File).arrayBuffer());

  let points;
  try {
    points = await parseKmzOrKmlPoints(bytes);
  } catch {
    redirect(
      "/corrals/import?error=No se pudo leer el archivo. ¿Es un .kmz/.kml válido?",
    );
  }

  if (!points || points.length === 0) {
    redirect(
      "/corrals/import?error=No se encontraron puntos (corrales) en el archivo",
    );
  }

  let created = 0;
  let updated = 0;

  for (const pt of points) {
    const number = pt.name;
    const data = {
      number,
      ranch,
      latitude: pt.latitude,
      longitude: pt.longitude,
      comment: pt.description,
    };

    const existing = await prisma.corral.findFirst({
      where: { number, ...(ranch ? { ranch } : {}) },
    });

    if (existing) {
      // No sobrescribimos hacienda si ya la tenía y no se indicó.
      await prisma.corral.update({
        where: { id: existing.id },
        data: {
          number,
          latitude: pt.latitude,
          longitude: pt.longitude,
          ranch: ranch ?? existing.ranch,
          comment: pt.description ?? existing.comment,
        },
      });
      updated++;
    } else {
      await prisma.corral.create({ data });
      created++;
    }
  }

  revalidatePath("/corrals");
  redirect(
    `/corrals?notice=${created} corral(es) creado(s) y ${updated} actualizado(s) desde el archivo`,
  );
}
